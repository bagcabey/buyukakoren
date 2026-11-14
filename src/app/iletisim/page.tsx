import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, School, ShieldAlert } from "lucide-react";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/iletisim", false);
  return {
    title: page?.seo_title || "İletişim | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Derneği iletişim formu, konum haritası, Büyük Akören Ortaokulu ve köy acil erişim bilgileri.",
    openGraph: page?.og_image ? { images: [page.og_image] } : undefined,
  };
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
      <PageBlocksRenderer page={page} storeData={storeData} />

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#666560] uppercase">
            <School className="h-4 w-4 text-red-800" />
            Doğrulanmış Resmî Eğitim Kurumu
          </div>
          <h3 className="mt-2 text-base font-bold text-[#191919]">
            Büyük Akören Ortaokulu (MEB)
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            T.C. Millî Eğitim Bakanlığı resmî telefon hattı ve kurum sayfası:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:+903467531122"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-semibold text-[#191919] hover:bg-[#f4f3ef]"
            >
              <Phone className="h-3.5 w-3.5 text-[#666560]" />
              (0346) 753 11 22
            </a>
            <a
              href="https://buyukakorenoo.meb.k12.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
            >
              buyukakorenoo.meb.k12.tr ↗
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#666560] uppercase">
            <ShieldAlert className="h-4 w-4 text-red-700" />
            Acil Durum Erişimi
          </div>
          <h3 className="mt-2 text-base font-bold text-[#191919]">
            112 Acil Çağrı Merkezi
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            Sağlık, jandarma ve itfaiye acil durumları için Türkiye geneli tek
            numara.
          </p>
          <div className="mt-3">
            <a
              href="tel:112"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#191919] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#333333]"
            >
              <Phone className="h-3.5 w-3.5" />
              112 Acil Ara
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
