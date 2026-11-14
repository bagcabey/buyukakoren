import fs from "fs";
import path from "path";
import { get, put } from "@vercel/blob";
import {
  decryptServerData,
  encryptServerData,
  isEncryptedPayload,
  isEncryptionConfigured,
} from "./crypto";
import { AuditLogEntry, SecurityStateData } from "./types";

const SECURITY_BLOB_PATH = "store/private/security-v2.enc";
const LOCAL_SECURITY_PATH = path.join(process.cwd(), "data", "security.enc.json");

function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

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
    users: Array.isArray(raw.users) ? raw.users : [],
    revoked_tokens: Array.isArray(raw.revoked_tokens)
      ? raw.revoked_tokens.filter((t) => t && typeof t.jti === "string" && t.exp > now)
      : [],
    audit_logs: Array.isArray(raw.audit_logs) ? raw.audit_logs.slice(0, 500) : [],
    login_failures: raw.login_failures && typeof raw.login_failures === "object" ? raw.login_failures : {},
    contact_submissions:
      raw.contact_submissions && typeof raw.contact_submissions === "object" ? raw.contact_submissions : {},
  };
}

function decodeSecurityPayload(rawText: string): SecurityStateData {
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
  return json;
}

async function readSecurityWithEtag(): Promise<{ state: SecurityStateData; etag?: string }> {
  if (isBlobConfigured()) {
    const result = await get(SECURITY_BLOB_PATH, {
      access: "public",
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return { state: defaultSecurityState() };
    }
    const text = await new Response(result.stream).text();
    try {
      return {
        state: decodeSecurityPayload(text),
        etag: result.blob.etag,
      };
    } catch (err) {
      console.error("[security-store] Şifreli güvenlik durumu çözümlenemedi:", err);
      throw new Error("Güvenlik durumu okunamadı.");
    }
  }

  try {
    if (!fs.existsSync(LOCAL_SECURITY_PATH)) {
      return { state: defaultSecurityState() };
    }
    const text = fs.readFileSync(LOCAL_SECURITY_PATH, "utf-8");
    return { state: decodeSecurityPayload(text) };
  } catch (err) {
    console.error("[security-store] Yerel güvenlik dosyası okunamadı:", err);
    return { state: defaultSecurityState() };
  }
}

export async function readSecurityState(): Promise<SecurityStateData> {
  const { state } = await readSecurityWithEtag();
  return state;
}

export async function mutateSecurityState(
  updater: (current: SecurityStateData) => SecurityStateData
): Promise<SecurityStateData> {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { state, etag } = await readSecurityWithEtag();
    const next = normalizeSecurityState(updater(state));
    const encoded = encodeSecurityPayload(next);

    if (isBlobConfigured()) {
      try {
        await put(SECURITY_BLOB_PATH, encoded, {
          access: "public",
          contentType: "text/plain; charset=utf-8",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 0,
          ...(etag ? { ifMatch: etag } : {}),
        });
        return next;
      } catch (err) {
        const isPrecondition =
          err instanceof Error &&
          (err.name === "BlobPreconditionFailedError" || err.message.includes("precondition"));
        if (isPrecondition && attempt < maxRetries - 1) {
          continue;
        }
        throw err;
      }
    } else {
      const dir = path.dirname(LOCAL_SECURITY_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_SECURITY_PATH, encoded, "utf-8");
      return next;
    }
  }
  throw new Error("Güvenlik durumu güncellenemedi (eşzamanlılık çakışması).");
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
