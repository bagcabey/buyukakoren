import { get, list } from "@vercel/blob";
import { decodeSecurityPayload, mutateSecurityState } from "./security-store";
import { decodeMessage, importContentStateIfPristine, persistMessage } from "./store";
import { StoreData } from "./types";

/**
 * Tek seferlik taşıma: eski Vercel Blob deposundaki içerik, kullanıcılar, işlem kayıtları ve
 * iletişim mesajlarını veritabanına aktarır. Tekrar çalıştırmak güvenlidir:
 * içerik yalnız veritabanında henüz düzenleme yoksa yazılır, kullanıcılar ve kayıtlar kimliğe göre birleşir.
 */

const STATE_PATH = "store/state-v2.json";
const SECURITY_PATH = "store/private/security-v2.enc";
const MSG_PREFIX = "store/private/msg-";

async function readBlobText(pathname: string): Promise<string | null> {
  const res = await get(pathname, { access: "public", useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  return new Response(res.stream).text();
}

export interface LegacyImportReport {
  content: "imported" | "skipped_db_already_edited" | "not_found";
  users_added: string[];
  audit_logs_added: number;
  messages_imported: number;
}

export async function importLegacyBlobData(): Promise<LegacyImportReport> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Eski Blob deposu bağlı değil (BLOB_READ_WRITE_TOKEN yok).");
  }

  const report: LegacyImportReport = {
    content: "not_found",
    users_added: [],
    audit_logs_added: 0,
    messages_imported: 0,
  };

  const stateText = await readBlobText(STATE_PATH);
  if (stateText) {
    const imported = await importContentStateIfPristine(JSON.parse(stateText) as Partial<StoreData>);
    report.content = imported ? "imported" : "skipped_db_already_edited";
  }

  const secText = await readBlobText(SECURITY_PATH);
  if (secText) {
    const legacy = decodeSecurityPayload(secText);
    await mutateSecurityState((s) => {
      const known = new Set(s.users.map((u) => u.username.toLowerCase()));
      const addedUsers = legacy.users.filter((u) => !known.has(u.username.toLowerCase()));
      report.users_added = addedUsers.map((u) => u.username);
      const knownLogs = new Set(s.audit_logs.map((l) => l.id));
      const addedLogs = legacy.audit_logs.filter((l) => !knownLogs.has(l.id));
      report.audit_logs_added = addedLogs.length;
      return {
        ...s,
        users: [...s.users, ...addedUsers],
        audit_logs: [...s.audit_logs, ...addedLogs].sort((a, b) =>
          b.timestamp.localeCompare(a.timestamp)
        ),
      };
    });
  }

  let cursor: string | undefined;
  do {
    const page = await list({ prefix: MSG_PREFIX, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const text = await readBlobText(blob.pathname);
      const msg = text ? decodeMessage(text) : null;
      if (msg) {
        await persistMessage(msg);
        report.messages_imported++;
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return report;
}
