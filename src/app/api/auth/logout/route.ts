import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  revokeSessionToken,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth";
import { hashIpAddress } from "@/lib/crypto";
import { getClientIp } from "@/lib/rate-limit";
import { appendAuditLog } from "@/lib/security-store";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        await revokeSessionToken(session.jti, session.exp);
        await appendAuditLog({
          username: session.sub,
          role: session.role,
          action: "auth.logout",
          target: "admin_session",
          ip_hash: hashIpAddress(getClientIp(request)),
        });
      }
    }
  } catch (err) {
    console.error("[auth/logout] Oturum iptal edilirken hata:", err);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
