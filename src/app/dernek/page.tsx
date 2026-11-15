import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { buildOrganizationJsonLd, buildPageMetadata } from "@/lib/seo";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/dernek", false);
  return buildPageMetadata({
    title:
      page?.seo_title ||
      "Derneğimiz ve Yönetim Kurulu | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği çalışma ilkeleri, yönetim kurulu başkanı Mustafa Tanju Çetiner ve tüzük hedefleri.",
    path: "/dernek",
    ogImage: page?.og_image,
  });
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
      <JsonLd data={buildOrganizationJsonLd(s)} />
      <Breadcrumbs items={[{ name: "Derneğimiz & Yönetim", href: "/dernek" }]} />
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
