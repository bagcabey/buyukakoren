import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PostsExplorer } from "@/components/PostsExplorer";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/store";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Büyükakören Köyü Duyuru ve Haberler | B.Akören",
  description:
    "Sivas Yıldızeli Büyükakören (Büyük Akören) köyü resmî duyuruları, haberler, dernek açıklamaları ve köy gündemi.",
  path: "/duyurular",
});

export default async function DuyurularPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori = "tumu" } = await searchParams;
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ name: "Duyuru & Haberler", href: "/duyurular" }]} />
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Dernek Bülteni
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Duyurular, Haberler ve Açıklamalar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Büyükakören (Büyük Akören) Köyü ve derneğimizle ilgili tüm güncel
          gelişmeler, resmî açıklamalar ve duyurular.
        </p>
      </div>

      <PostsExplorer posts={posts} initialCategory={kategori} />
    </div>
  );
}
