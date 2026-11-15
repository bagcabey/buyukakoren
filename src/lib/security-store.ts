import fs from "fs";
import path from "path";
import {
  decryptServerData,
  encryptServerData,
  isEncryptedPayload,
  isEncryptionConfigured,
} from "./crypto";
import { isDbConfigured, mutateDocument, readDocument } from "./db";
import { AuditLogEntry, SecurityStateData } from "./types";

const SECURITY_DOC_KEY = "security";
const LOCAL_SECURITY_PATH = path.join(process.cwd(), "data", "security.enc.json");

function defaultSecurityState(): SecurityStateData {
  return {
    users: [],
    revoked_tokens: [],
    audit_logs: [],
    login_failures: {},
    contact_submissions: {},
  };
}

function normalizeSecurityState(raw: Partial<SecurityStateData> | null | undefined): SecurityStateData {
  const now = Date.now();
  const base = defaultSecurityState();
  if (!raw) return base;
  return {
    users: Array.isArray(raw.users)
      ? raw.users.map((u) =>
          u && (u.id === "user-admin-1" || u.username === "admin")
            ? { ...u, username: "yönetmenbgc" }
            : u
        )
      : [],
    revoked_tokens: Array.isArray(raw.revoked_tokens)
      ? raw.revoked_tokens.filter((t) => t && typeof t.jti === "string" && t.exp > now)
      : [],
    audit_logs: Array.isArray(raw.audit_logs) ? raw.audit_logs.slice(0, 500) : [],
    login_failures: raw.login_failures && typeof raw.login_failures === "object" ? raw.login_failures : {},
    contact_submissions:
      raw.contact_submissions && typeof raw.contact_submissions === "object" ? raw.contact_submissions : {},
  };
}

export function decodeSecurityPayload(rawText: string): SecurityStateData {
  if (!rawText || !rawText.trim()) return defaultSecurityState();
  const trimmed = rawText.trim();
  if (isEncryptedPayload(trimmed)) {
    const plain = decryptServerData(trimmed);
    return normalizeSecurityState(JSON.parse(plain) as Partial<SecurityStateData>);
  }
  return normalizeSecurityState(JSON.parse(trimmed) as Partial<SecurityStateData>);
}

function encodeSecurityPayload(state: SecurityStateData): string {
  const clean = normalizeSecurityState(state);
  const json = JSON.stringify(clean);
  if (isEncryptionConfigured()) {
    return encryptServerData(json);
  }
  if (isDbConfigured()) {
    throw new Error(
      "Kritik Güvenlik Hatası: şifreleme anahtarı yapılandırılmadan güvenlik verileri veritabanına açık metin yazılamaz."
    );
  }
  return json;
}

function readLocalSecurityState(): SecurityStateData {
  try {
    if (!fs.existsSync(LOCAL_SECURITY_PATH)) {
      return defaultSecurityState();
    }
    return decodeSecurityPayload(fs.readFileSync(LOCAL_SECURITY_PATH, "utf-8"));
  } catch (err) {
    console.error("[security-store] Yerel güvenlik dosyası okunamadı:", err);
    return defaultSecurityState();
  }
}

/**
 * Güvenlik durumunu okur. Veritabanı yapılandırılmışsa okuma hatası yukarı fırlatılır:
 * boş durumla devam etmek, kayıtlı kullanıcılar varken ilk kurulum şifresini geçerli kılardı.
 */
export async function readSecurityState(): Promise<SecurityStateData> {
  if (isDbConfigured()) {
    const body = await readDocument(SECURITY_DOC_KEY);
    return body ? decodeSecurityPayload(body) : defaultSecurityState();
  }
  return readLocalSecurityState();
}

export async function mutateSecurityState(
  updater: (current: SecurityStateData) => SecurityStateData
): Promise<SecurityStateData> {
  if (isDbConfigured()) {
    return mutateDocument(SECURITY_DOC_KEY, (body) => {
      const current = body ? decodeSecurityPayload(body) : defaultSecurityState();
      const next = normalizeSecurityState(updater(current));
      return { body: encodeSecurityPayload(next), result: next };
    });
  }

  const next = normalizeSecurityState(updater(readLocalSecurityState()));
  const encoded = encodeSecurityPayload(next);
  const dir = path.dirname(LOCAL_SECURITY_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(LOCAL_SECURITY_PATH, encoded, "utf-8");
  return next;
}

export async function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
  try {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    await mutateSecurityState((state) => ({
      ...state,
      audit_logs: [newEntry, ...state.audit_logs].slice(0, 500),
    }));
  } catch (err) {
    console.error("[audit] İşlem günlüğü yazılamadı:", err);
  }
}
