import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import {
  buildEducationalOrganizationJsonLd,
  buildPageMetadata,
  buildPlaceJsonLd,
} from "@/lib/seo";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/koyumuz", false);
  return buildPageMetadata({
    title:
      page?.seo_title || "Büyükakören Köyü Tarihçesi ve Nüfusu | Yıldızeli, Sivas",
    description:
      page?.seo_description ||
      "Sivas Yıldızeli Büyükakören Köyü tarihi (1907 Ağören, 1928 Akviran), 3 mahalle, TÜİK 1990-2025 nüfusu, coğrafyası ve Büyük Akören Ortaokulu bilgileri.",
    path: "/koyumuz",
    ogImage: page?.og_image,
  });
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
      <JsonLd data={buildPlaceJsonLd()} />
      <JsonLd data={buildEducationalOrganizationJsonLd()} />
      <Breadcrumbs items={[{ name: "Köyümüz & Tarihçe", href: "/koyumuz" }]} />
      <PageBlocksRenderer page={page} storeData={storeData} />
    </div>
  );
}
