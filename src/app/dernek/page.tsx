import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/dernek", false);
  return {
    title:
      page?.seo_title ||
      "Büyük Akören Köyü Derneği | Kurumsal Yapı ve Yönetim Kurulu",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği tüzük amaçları, çalışma ilkeleri ve yönetim kurulu bilgileri.",
    openGraph: page?.og_image ? { images: [page.og_image] } : undefined,
  };
}

export default async function DernekPage() {
  const [page, storeData] = await Promise.all([
    getPageBySlug("/dernek", false),
    getAllStoreData(false),
  ]);

  if (!page) {
    notFound();
  }

  const s = storeData.site_settings;
  const hasOfficialDetails = Boolean(
    s.founded_year?.trim() ||
      s.association_registry_no?.trim() ||
      s.tax_office?.trim()
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <PageBlocksRenderer page={page} storeData={storeData} />

      {hasOfficialDetails && (
        <section className="mt-10 rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#191919]">
            Resmî Dernek Sicil Bilgileri
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            {s.founded_year?.trim() && (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
                <dt className="text-xs text-[#666560]">Kuruluş Yılı</dt>
                <dd className="mt-1 font-semibold text-[#191919]">
                  {s.founded_year}
                </dd>
              </div>
            )}
            {s.association_registry_no?.trim() && (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
                <dt className="text-xs text-[#666560]">Dernek Kütük No</dt>
                <dd className="mt-1 font-semibold text-[#191919]">
                  {s.association_registry_no}
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
          </dl>
        </section>
      )}
    </div>
  );
}
