import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { PageBlocksRenderer } from "./PageBlocksRenderer";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export async function LegalPageShell({
  slug,
  showInstitutionalCard = false,
}: {
  slug: "/kvkk" | "/gizlilik" | "/kullanim-kosullari" | "/kunye";
  showInstitutionalCard?: boolean;
}) {
  const [page, storeData] = await Promise.all([
    getPageBySlug(slug, false),
    getAllStoreData(false),
  ]);

  if (!page) {
    notFound();
  }

  const s = storeData.site_settings;

  const labelMap: Record<typeof slug, string> = {
    "/kvkk": "KVKK Aydınlatma Metni",
    "/gizlilik": "Gizlilik ve Çerez Politikası",
    "/kullanim-kosullari": "Kullanım Koşulları",
    "/kunye": "Kurumsal Künye",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ name: labelMap[slug], href: slug }]} />
      <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
        <nav aria-label="Yasal sayfalar" className="flex flex-wrap gap-2 text-xs">
          {[
            { href: "/kvkk", label: "KVKK" },
            { href: "/gizlilik", label: "Gizlilik & Çerezler" },
            { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
            { href: "/kunye", label: "Künye" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-[36px] items-center rounded-lg border px-2.5 py-1 font-medium transition-colors ${
                slug === item.href
                  ? "border-[#191919] bg-[#191919] text-white"
                  : "border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {showInstitutionalCard && (
        <section className="mb-8 rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-6 sm:p-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-800">
            <ShieldCheck className="h-4 w-4" />
            Resmî Kurum Bilgileri
          </div>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
              <dt className="text-xs text-[#666560]">Dernek Resmî Unvanı</dt>
              <dd className="mt-1 font-semibold text-[#191919]">
                {s.association_name}
              </dd>
            </div>
            <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
              <dt className="text-xs text-[#666560]">Merkez Adresi</dt>
              <dd className="mt-1 font-semibold text-[#191919]">
                {s.association_address || "Büyükakören Köyü, Yıldızeli / Sivas (58502)"}
              </dd>
            </div>
            {s.association_registry_no?.trim() && (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
                <dt className="text-xs text-[#666560]">Dernek Kütük No (DERBİS)</dt>
                <dd className="mt-1 font-semibold text-[#191919]">
                  {s.association_registry_no}
                </dd>
              </div>
            )}
            {s.founded_year?.trim() && (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
                <dt className="text-xs text-[#666560]">Kuruluş Yılı</dt>
                <dd className="mt-1 font-semibold text-[#191919]">
                  {s.founded_year}
                </dd>
              </div>
            )}
            {s.tax_office?.trim() && (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
                <dt className="text-xs text-[#666560]">Vergi Dairesi</dt>
                <dd className="mt-1 font-semibold text-[#191919]">
                  {s.tax_office}
                </dd>
              </div>
            )}
            {s.show_association_phone && s.association_phone?.trim() && (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
                <dt className="text-xs text-[#666560]">Resmî Telefon</dt>
                <dd className="mt-1 font-semibold text-[#191919]">
                  {s.association_phone}
                </dd>
              </div>
            )}
            {s.association_email?.trim() && (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
                <dt className="text-xs text-[#666560]">Resmî E-posta</dt>
                <dd className="mt-1 font-semibold text-[#191919]">
                  {s.association_email}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <PageBlocksRenderer page={page} storeData={storeData} />
    </div>
  );
}
