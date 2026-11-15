import { Pool, PoolClient } from "pg";

/**
 * Kalıcı veri katmanı: Postgres (Vercel üzerinden bağlı Neon).
 * İçerik ve güvenlik durumu `app_documents` tablosunda belge olarak, iletişim mesajları
 * `contact_messages` tablosunda satır satır tutulur. Blob yalnız görsel dosyaları içindir.
 */

const DATABASE_URL =
  process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";

export function isDbConfigured(): boolean {
  return DATABASE_URL.length > 0;
}

const globalForDb = globalThis as unknown as {
  __akorenPool?: Pool;
  __akorenSchema?: Promise<void>;
};

function getPool(): Pool {
  if (!isDbConfigured()) {
    throw new Error("Veritabanı bağlantısı (DATABASE_URL) yapılandırılmamış.");
  }
  if (!globalForDb.__akorenPool) {
    globalForDb.__akorenPool = new Pool({
      connectionString: DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForDb.__akorenPool;
}

async function ensureSchema(): Promise<void> {
  if (!globalForDb.__akorenSchema) {
    globalForDb.__akorenSchema = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS app_documents (
           key text PRIMARY KEY,
           body text NOT NULL,
           updated_at timestamptz NOT NULL DEFAULT now()
         );
         CREATE TABLE IF NOT EXISTS contact_messages (
           id text PRIMARY KEY,
           created_at timestamptz NOT NULL,
           body text NOT NULL
         );
         CREATE INDEX IF NOT EXISTS contact_messages_created_idx
           ON contact_messages (created_at DESC);`
      )
      .then(() => undefined)
      .catch((err) => {
        globalForDb.__akorenSchema = undefined;
        throw err;
      });
  }
  return globalForDb.__akorenSchema;
}

async function query<T extends object>(text: string, params: unknown[] = []) {
  await ensureSchema();
  return getPool().query<T & Record<string, unknown>>(text, params);
}

export async function readDocument(key: string): Promise<string | null> {
  const res = await query<{ body: string }>(
    "SELECT body FROM app_documents WHERE key = $1",
    [key]
  );
  return res.rows[0]?.body ?? null;
}

/**
 * Belgeyi kilitleyerek okur, `updater` ile yeni gövdeyi üretir ve aynı işlemde yazar.
 * Aynı anahtar için eşzamanlı güncellemeler sıraya girer; kayıp güncelleme olmaz.
 */
export async function mutateDocument<R>(
  key: string,
  updater: (current: string | null) => Promise<{ body: string; result: R }> | { body: string; result: R }
): Promise<R> {
  await ensureSchema();
  const client: PoolClient = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
    const cur = await client.query<{ body: string }>(
      "SELECT body FROM app_documents WHERE key = $1",
      [key]
    );
    const { body, result } = await updater(cur.rows[0]?.body ?? null);
    await client.query(
      `INSERT INTO app_documents (key, body, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET body = EXCLUDED.body, updated_at = now()`,
      [key, body]
    );
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

export async function listMessageBodies(): Promise<string[]> {
  const res = await query<{ body: string }>(
    "SELECT body FROM contact_messages ORDER BY created_at DESC"
  );
  return res.rows.map((r) => r.body);
}

export async function readMessageBody(id: string): Promise<string | null> {
  const res = await query<{ body: string }>(
    "SELECT body FROM contact_messages WHERE id = $1",
    [id]
  );
  return res.rows[0]?.body ?? null;
}

export async function upsertMessageBody(
  id: string,
  createdAt: string,
  body: string
): Promise<void> {
  await query(
    `INSERT INTO contact_messages (id, created_at, body) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET body = EXCLUDED.body`,
    [id, createdAt, body]
  );
}

export async function deleteMessageRow(id: string): Promise<void> {
  await query("DELETE FROM contact_messages WHERE id = $1", [id]);
}
