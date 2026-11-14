import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getServerKeyMaterial,
  hashPassword,
  safeCompareStrings,
  verifyPassword,
} from "./crypto";
import { mutateSecurityState, readSecurityState } from "./security-store";
import { AdminRole, AdminUser } from "./types";

export const SESSION_COOKIE_NAME = "akoren_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 saat

export interface AdminSessionPayload {
  sub: string;
  displayName: string;
  role: AdminRole;
  jti: string;
  iat: number;
  exp: number;
}

function getSessionSecret(): string | null {
  return getServerKeyMaterial();
}

function signPayload(payloadB64: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
}

export function createSessionToken(user: {
  username: string;
  display_name: string;
  role: AdminRole;
}): { token: string; payload: AdminSessionPayload } {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("Oturum imza anahtarı yapılandırılmamış.");
  }
  const now = Date.now();
  const payload: AdminSessionPayload = {
    sub: user.username,
    displayName: user.display_name,
    role: user.role,
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + SESSION_TTL_SECONDS * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = signPayload(payloadB64, secret);
  return { token: `${payloadB64}.${sig}`, payload };
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== "string") return null;
  const secret = getSessionSecret();
  if (!secret) return null;

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return null;

  const payloadB64 = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!payloadB64 || !sig) return null;

  const expectedSig = signPayload(payloadB64, secret);
  if (!safeCompareStrings(sig, expectedSig)) {
    return null;
  }

  let parsed: AdminSessionPayload;
  try {
    parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as AdminSessionPayload;
  } catch {
    return null;
  }

  if (
    !parsed ||
    typeof parsed.sub !== "string" ||
    typeof parsed.jti !== "string" ||
    typeof parsed.exp !== "number" ||
    typeof parsed.iat !== "number"
  ) {
    return null;
  }

  if (Date.now() > parsed.exp) {
    return null;
  }

  // Sunucu tarafında iptal edilen token veya kullanıcı kontrolü
  try {
    const secState = await readSecurityState();
    const isRevoked = secState.revoked_tokens.some((r) => r.jti === parsed.jti);
    if (isRevoked) {
      return null;
    }
    const userRecord = secState.users.find((u) => u.username === parsed.sub);
    if (userRecord) {
      if (!userRecord.is_active) {
        return null;
      }
      if (userRecord.revoked_before && parsed.iat < userRecord.revoked_before) {
        return null;
      }
    }
  } catch (err) {
    console.error("[auth] Güvenlik durumu doğrulanamadı:", err);
    return null;
  }

  return parsed;
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function requireAdminAuth(allowedRoles?: AdminRole[]): Promise<
  | { session: AdminSessionPayload; errorResponse?: never }
  | { session?: never; errorResponse: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Yetkisiz erişim. Lütfen giriş yapın." },
        { status: 401 }
      ),
    };
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Bu işlem için yönetici yetkisi gereklidir." },
        { status: 403 }
      ),
    };
  }
  return { session };
}

export async function revokeSessionToken(jti: string, exp: number): Promise<void> {
  if (!jti) return;
  await mutateSecurityState((state) => ({
    ...state,
    revoked_tokens: [
      ...state.revoked_tokens.filter((item) => item.jti !== jti && item.exp > Date.now()),
      { jti, exp: exp || Date.now() + SESSION_TTL_SECONDS * 1000 },
    ],
  }));
}

export interface AuthAttemptResult {
  ok: boolean;
  configMissing?: boolean;
  user?: {
    id: string;
    username: string;
    display_name: string;
    role: AdminRole;
  };
}

export async function authenticateAdminCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<AuthAttemptResult> {
  if (!getSessionSecret()) {
    return { ok: false, configMissing: true };
  }

  const username = (usernameInput || "admin").trim().toLowerCase();
  const password = typeof passwordInput === "string" ? passwordInput : "";
  if (!username || !password) {
    return { ok: false };
  }

  const secState = await readSecurityState();
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  // 1) Veritabanında kayıtlı kullanıcı varsa doğrula
  const existingUser = secState.users.find((u) => u.username.toLowerCase() === username);
  if (existingUser) {
    if (!existingUser.is_active) {
      return { ok: false };
    }
    if (verifyPassword(password, existingUser.password_hash)) {
      await mutateSecurityState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === existingUser.id ? { ...u, last_login_at: new Date().toISOString() } : u
        ),
      }));
      return {
        ok: true,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          display_name: existingUser.display_name,
          role: existingUser.role,
        },
      };
    }
    return { ok: false };
  }

  // 2) Henüz hiç kullanıcı oluşturulmamışsa ve env ADMIN_PASSWORD tanımlıysa ilk yöneticiyi doğrula
  if (secState.users.length === 0) {
    if (!envPassword) {
      return { ok: false, configMissing: true };
    }
    if (username === "admin" && safeCompareStrings(password, envPassword)) {
      const now = new Date().toISOString();
      const bootstrapAdmin: AdminUser = {
        id: "user-admin-1",
        username: "admin",
        display_name: "Baş Yönetici",
        role: "yonetici",
        password_hash: hashPassword(envPassword),
        is_active: true,
        created_at: now,
        updated_at: now,
        last_login_at: now,
      };
      await mutateSecurityState((s) => ({
        ...s,
        users: s.users.length === 0 ? [bootstrapAdmin] : s.users,
      }));
      return {
        ok: true,
        user: {
          id: bootstrapAdmin.id,
          username: bootstrapAdmin.username,
          display_name: bootstrapAdmin.display_name,
          role: bootstrapAdmin.role,
        },
      };
    }
    return { ok: false };
  }

  return { ok: false };
}
