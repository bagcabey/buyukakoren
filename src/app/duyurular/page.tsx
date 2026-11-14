import { PostsExplorer } from "@/components/PostsExplorer";
import { getPublishedPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DuyurularPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori = "tumu" } = await searchParams;
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Dernek Bülteni
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Duyurular, Haberler ve Açıklamalar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Büyük Akören Köyü ve derneğimizle ilgili tüm güncel gelişmeler, resmî
          açıklamalar ve duyurular.
        </p>
      </div>

      <PostsExplorer posts={posts} initialCategory={kategori} />
    </div>
  );
}
