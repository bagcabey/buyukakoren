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
      <div className="rounded-2xl border border-red-200/80 border-l-4 border-l-[#b5091a] bg-gradient-to-r from-[#fdf5f5] via-white to-[#faf8f5] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#b5091a] px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
            Bölüm • Duyuru & Haberler
          </span>
          <span className="text-xs font-medium tracking-wider text-[#666560] uppercase">
            Dernek Bülteni
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#191919] sm:text-3xl">
          Duyurular, Haberler ve Açıklamalar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#44433f]">
          Büyükakören (Büyük Akören) Köyü ve derneğimizle ilgili tüm güncel
          gelişmeler, resmî açıklamalar ve duyurular.
        </p>
      </div>

      <PostsExplorer posts={posts} initialCategory={kategori} />
    </div>
  );
}
