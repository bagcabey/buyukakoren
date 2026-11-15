/**
 * Gerçek Postgres'e karşı veri katmanı denemesi.
 * Çalıştırma: DATABASE_URL=postgres://... ADMIN_SESSION_SECRET=... ADMIN_PASSWORD=... npx tsx tests/db/postgres.test.ts
 */
import assert from "assert";
import { authenticateAdminCredentials } from "../../src/lib/auth";
import { hashPassword, verifyPassword } from "../../src/lib/crypto";
import { isDbConfigured, readDocument } from "../../src/lib/db";
import { mutateSecurityState, readSecurityState } from "../../src/lib/security-store";
import {
  createContactMessage,
  deleteContactMessage,
  getAllStoreData,
  getContactMessages,
  markMessageRead,
  updateSiteSettings,
  VersionConflictError,
  getStoreVersion,
} from "../../src/lib/store";

async function main() {
  assert(isDbConfigured(), "DATABASE_URL gerekli");
  const envPw = process.env.ADMIN_PASSWORD!;

  // 1) İlk giriş: kullanıcı yokken ADMIN_PASSWORD ile yönetici oluşur ve kalıcı yazılır
  let r = await authenticateAdminCredentials("yönetmenbgc", envPw);
  assert(r.ok, "ilk giriş");
  let sec = await readSecurityState();
  assert.equal(sec.users.length, 1, "yönetici kaydı veritabanında");
  const raw = await readDocument("security");
  assert(raw && !raw.includes("yönetmenbgc"), "güvenlik belgesi şifreli");

  // 2) Panelden şifre değişimi kalıcı: yeni şifre geçer, ADMIN_PASSWORD artık geçmez
  await mutateSecurityState((s) => ({
    ...s,
    users: s.users.map((u) => ({ ...u, password_hash: hashPassword("YeniSifre!2026") })),
  }));
  assert((await authenticateAdminCredentials("yönetmenbgc", "YeniSifre!2026")).ok, "yeni şifre");
  assert(!(await authenticateAdminCredentials("yönetmenbgc", envPw)).ok, "eski env şifresi reddedilir");

  // 3) Kullanıcı ekleme kalıcı
  await mutateSecurityState((s) => ({
    ...s,
    users: [
      ...s.users,
      {
        id: "user-test-2",
        username: "dernekbaskani",
        display_name: "Dernek Başkanı",
        role: "yonetici",
        password_hash: hashPassword("Baskan!2026x"),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  }));
  r = await authenticateAdminCredentials("dernekbaskani", "Baskan!2026x");
  assert(r.ok && r.user?.role === "yonetici", "eklenen kullanıcı girer");

  // 4) Eşzamanlı 20 güncelleme: hiçbiri kaybolmaz
  const before = (await readSecurityState()).audit_logs.length;
  await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      mutateSecurityState((s) => ({
        ...s,
        audit_logs: [
          { id: `c-${i}`, timestamp: new Date().toISOString(), username: "t", role: "system", action: "test", target: "x" },
          ...s.audit_logs,
        ],
      }))
    )
  );
  assert.equal((await readSecurityState()).audit_logs.length, before + 20, "kayıp güncelleme yok");

  // 5) İçerik: sürüm artar, eski sürümle yazma çakışma verir
  const v1 = await getStoreVersion();
  await updateSiteSettings({ association_name: "Deneme Derneği" } as never);
  const v2 = await getStoreVersion();
  assert.equal(v2, v1 + 1, "sürüm arttı");
  const data = await getAllStoreData(true);
  assert.equal((data.site_settings as unknown as { association_name: string }).association_name, "Deneme Derneği");

  // 6) Mesajlar: şifreli kayıt, okundu işareti, silme
  const m = await createContactMessage({ name: "Ali", email: "a@b.co", phone: "", subject: "Konu", message: "Merhaba", kvkk_consent: true } as never);
  let msgs = await getContactMessages();
  assert(msgs.some((x) => x.id === m.id && !x.is_read), "mesaj kaydı");
  await markMessageRead(m.id, true);
  msgs = await getContactMessages();
  assert(msgs.find((x) => x.id === m.id)?.is_read, "okundu");
  await deleteContactMessage(m.id);
  assert(!(await getContactMessages()).some((x) => x.id === m.id), "silindi");

  assert(verifyPassword("YeniSifre!2026", (await readSecurityState()).users[0].password_hash));
  void VersionConflictError;
  console.log("POSTGRES VERİ KATMANI: TÜM DENEMELER GEÇTİ");
  process.exit(0);
}

main().catch((e) => {
  console.error("BAŞARISIZ:", e);
  process.exit(1);
});
