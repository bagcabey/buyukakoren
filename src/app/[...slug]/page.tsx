import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { getAllStoreData, getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

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
  return {
    title: page.seo_title || `${page.title} | Büyük Akören Köyü Derneği`,
    description: page.seo_description || undefined,
    openGraph: page.og_image ? { images: [page.og_image] } : undefined,
  };
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
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#666560] hover:text-[#191919]"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfaya Dön
      </Link>
      <PageBlocksRenderer page={page} storeData={storeData} />
    </div>
  );
}
