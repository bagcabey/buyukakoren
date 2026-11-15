import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { importLegacyBlobData } from "@/lib/legacy-blob-import";
import { appendAuditLog } from "@/lib/security-store";

export const dynamic = "force-dynamic";

/** Eski Blob verisini veritabanına taşır (yalnız yönetici). */
export async function POST() {
  const auth = await requireAdminAuth(["yonetici"]);
  if (auth.errorResponse) return auth.errorResponse;
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Veritabanı yapılandırılmamış." }, { status: 503 });
  }
  try {
    const report = await importLegacyBlobData();
    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "data.import_legacy",
      target: "blob",
      detail: JSON.stringify(report),
    });
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Taşıma başarısız." },
      { status: 502 }
    );
  }
}
