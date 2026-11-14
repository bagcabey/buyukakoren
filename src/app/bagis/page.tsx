import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/bagis", false);
  return {
    title:
      page?.seo_title || "Bağış ve Aidat Bilgileri | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî bağış ve üyelik aidatı bilgilendirme sayfası.",
    openGraph: page?.og_image ? { images: [page.og_image] } : undefined,
  };
}

export default async function BagisPage() {
  const [page, storeData] = await Promise.all([
    getPageBySlug("/bagis", false),
    getAllStoreData(false),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <PageBlocksRenderer page={page} storeData={storeData} isDonatePage />
    </div>
  );
}
