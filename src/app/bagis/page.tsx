import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { buildPageMetadata } from "@/lib/seo";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/bagis", false);
  return buildPageMetadata({
    title: page?.seo_title || "Bağış ve Aidat | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyükakören (Büyük Akören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî bağış ve üyelik aidatı bilgilendirme sayfası.",
    path: "/bagis",
    ogImage: page?.og_image,
  });
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
      <Breadcrumbs items={[{ name: "Bağış & Aidat", href: "/bagis" }]} />
      <PageBlocksRenderer page={page} storeData={storeData} isDonatePage />
    </div>
  );
}
