import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, ShieldAlert, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import {
  buildContactPageJsonLd,
  buildEducationalOrganizationJsonLd,
  buildPageMetadata,
} from "@/lib/seo";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/iletisim", false);
  return buildPageMetadata({
    title:
      page?.seo_title || "İletişim Bilgileri | Büyük Akören Köyü",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Derneği iletişim hattı (+90 542 349 58 90), güvenli iletişim formu ve konum haritası.",
    path: "/iletisim",
    ogImage: page?.og_image,
  });
}

export default async function IletisimPage() {
  const [page, storeData] = await Promise.all([
    getPageBySlug("/iletisim", false),
    getAllStoreData(false),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <JsonLd data={buildContactPageJsonLd(storeData.site_settings)} />
      <JsonLd data={buildEducationalOrganizationJsonLd()} />
      <Breadcrumbs items={[{ name: "İletişim", href: "/iletisim" }]} />
      <PageBlocksRenderer page={page} storeData={storeData} />

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#666560] uppercase">
            <Users className="h-4 w-4 text-emerald-800" />
            Dernek İletişim Hattı
          </div>
          <h3 className="mt-2 text-base font-bold text-[#191919]">
            Büyük Akören Köyü Derneği
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            Dernek Başkanı: <strong className="text-[#191919]">Mustafa Çetiner</strong>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:+905423495890"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-semibold text-[#191919] hover:bg-[#f4f3ef]"
            >
              <Phone className="h-3.5 w-3.5 text-[#666560]" />
              +90 542 349 58 90
            </a>
            <a
              href="https://wa.me/905423495890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
            >
              WhatsApp ↗
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#666560] uppercase">
            <ShieldAlert className="h-4 w-4 text-red-700" />
            Acil Durum & Mülki İdare
          </div>
          <h3 className="mt-2 text-base font-bold text-[#191919]">
            112 Acil & Resmî İdare
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            Acil durumlar ve Sivas Valiliği resmî hizmet bağlantıları.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:112"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#191919] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#333333]"
            >
              <Phone className="h-3.5 w-3.5" />
              112 Acil Ara
            </a>
            <a
              href="http://www.sivas.gov.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
            >
              Sivas Valiliği ↗
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
