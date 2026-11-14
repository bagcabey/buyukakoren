import crypto from "crypto";

const ENC_PREFIX = "enc:v1:";

/**
 * Derives a 32-byte server-only secret key from environment variables.
 * Never falls back to hardcoded strings; returns null if no secret material is available.
 */
export function getServerKeyMaterial(): string | null {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (sessionSecret && sessionSecret.length >= 16) {
    return sessionSecret;
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (blobToken && blobToken.length >= 16) {
    return crypto
      .createHmac("sha256", blobToken)
      .update("akoren-server-key-derivation-v1")
      .digest("hex");
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceRole && serviceRole.length >= 16) {
    return crypto
      .createHmac("sha256", serviceRole)
      .update("akoren-server-key-derivation-v1")
      .digest("hex");
  }

  return null;
}

function deriveAesKey(): Buffer {
  const material = getServerKeyMaterial();
  if (!material) {
    throw new Error("Sunucu şifreleme anahtarı yapılandırılmamış.");
  }
  return crypto
    .createHash("sha256")
    .update(`akoren-aes-256-gcm-v1:${material}`)
    .digest();
}

export function isEncryptionConfigured(): boolean {
  return getServerKeyMaterial() !== null;
}

export function encryptServerData(plainText: string): string {
  const key = deriveAesKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${ENC_PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptServerData(payload: string): string {
  if (!payload.startsWith(ENC_PREFIX)) {
    throw new Error("Şifreli veri biçimi geçersiz.");
  }
  const body = payload.slice(ENC_PREFIX.length);
  const parts = body.split(":");
  if (parts.length !== 3) {
    throw new Error("Şifreli veri blokları bozuk.");
  }
  const [ivB64, tagB64, dataB64] = parts;
  const key = deriveAesKey();
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const encrypted = Buffer.from(dataB64, "base64url");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function isEncryptedPayload(value: string): boolean {
  return typeof value === "string" && value.startsWith(ENC_PREFIX);
}

/**
 * Hashes a password with scrypt + 16-byte random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:v1:${salt}:${derived}`;
}

/**
 * Constant-time password verification against scrypt hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 4 || parts[0] !== "scrypt" || parts[1] !== "v1") {
    return false;
  }
  const [, , salt, expectedHex] = parts;
  const expectedBuf = Buffer.from(expectedHex, "hex");
  const actualBuf = crypto.scryptSync(password, salt, 64);
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Constant-time plain string comparison with length protection.
 */
export function safeCompareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function hashIpAddress(ip: string): string {
  const material = getServerKeyMaterial() || "akoren-anon-ip-salt";
  return crypto
    .createHmac("sha256", material)
    .update(ip)
    .digest("hex")
    .slice(0, 16);
}
