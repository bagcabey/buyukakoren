import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/koyumuz", false);
  return {
    title:
      page?.seo_title ||
      "Büyükakören (Büyük Akören) Köyü Tarihçe ve Nüfusu | Yıldızeli",
    description:
      page?.seo_description ||
      "Sivas Yıldızeli Büyükakören Köyü tarihçesi (1907 Ağören, 1928 Büyük Akviran), coğrafyası (1.276 m rakım, 33,8 km²) ve TÜİK 1990-2025 nüfus verileri.",
    openGraph: page?.og_image ? { images: [page.og_image] } : undefined,
  };
}

export default async function KoyumuzPage() {
  const [page, storeData] = await Promise.all([
    getPageBySlug("/koyumuz", false),
    getAllStoreData(false),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <PageBlocksRenderer page={page} storeData={storeData} />
    </div>
  );
}
