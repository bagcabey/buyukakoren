import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { buildPageMetadata } from "@/lib/seo";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const normalized = `/${slug.join("/")}`;
  const page = await getPageBySlug(normalized, false);
  if (!page || page.status !== "published") {
    notFound();
  }
  return buildPageMetadata({
    title: page.seo_title || `${page.title} | Büyük Akören Köyü Derneği`,
    description:
      page.seo_description ||
      `${page.title} — Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği.`,
    path: normalized,
    ogImage: page.og_image,
  });
}

export default async function CustomCmsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const normalized = `/${slug.join("/")}`;
  const [page, storeData] = await Promise.all([
    getPageBySlug(normalized, false),
    getAllStoreData(false),
  ]);

  if (!page || page.status !== "published") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ name: page.title, href: normalized }]} />
      <PageBlocksRenderer page={page} storeData={storeData} />
    </div>
  );
}
