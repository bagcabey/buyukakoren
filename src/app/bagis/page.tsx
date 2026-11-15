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
    title:
      page?.seo_title || "Bağış ve Üyelik Aidatı | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Derneği şeffaf bağış ve aidat bilgilendirmesi; 5253 sayılı Dernekler Kanunu mevzuatı ve resmî banka hesabı.",
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
