import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, HeartHandshake, Pin } from "lucide-react";
import { PageBlocksRenderer } from "@/components/PageBlocksRenderer";
import { formatDateTR } from "@/lib/format";
import { getAllStoreData, getPageBySlug, getPublishedPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/", false);
  return {
    title:
      page?.seo_title ||
      "B.Akören | Büyük Akören Köyü Derneği — Sivas Yıldızeli",
    description:
      page?.seo_description ||
      "Sivas Yıldızeli Büyükakören (Büyük Akören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî duyuru, faaliyet, taziye ve bilgi portalı.",
    openGraph: page?.og_image ? { images: [page.og_image] } : undefined,
  };
}

export default async function HomePage() {
  const [page, posts, storeData] = await Promise.all([
    getPageBySlug("/", false),
    getPublishedPosts(),
    getAllStoreData(false),
  ]);

  const pinnedPost = posts.find((p) => p.is_pinned);
  const recentCondolences = (storeData.condolences || [])
    .filter(
      (c) =>
        c.is_published &&
        c.deceased_name &&
        !c.deceased_name.toLowerCase().includes("örnek")
    )
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {pinnedPost && (
        <Link
          href={`/duyurular/${pinnedPost.slug}`}
          className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] px-3.5 py-2.5 transition-all hover:border-[#cfcec8] hover:bg-[#f4f3ef] sm:px-4 sm:py-3"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#191919] px-2 py-1 text-[10px] font-semibold tracking-wide text-white sm:text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <Pin className="hidden h-3 w-3 sm:inline" />
              Sabit Duyuru
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#191919] sm:text-[13px]">
                {pinnedPost.title}
              </p>
              <p className="text-[10px] text-[#666560] sm:hidden">
                {formatDateTR(pinnedPost.published_at)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs text-[#666560] sm:inline">
              {formatDateTR(pinnedPost.published_at)}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#191919]">
              İncele
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      )}

      {page && (
        <PageBlocksRenderer page={page} storeData={{ ...storeData, posts }} />
      )}

      {recentCondolences.length > 0 && (
        <section className="mt-12 rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-6 sm:mt-14 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-[#191919]" />
              <h2 className="text-lg font-bold text-[#191919]">
                Güncel Vefat & Taziye İlanları
              </h2>
            </div>
            <Link
              href="/taziye"
              className="text-xs font-semibold text-[#191919] hover:underline"
            >
              Tüm İlanlar →
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {recentCondolences.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#e6e5e0] bg-white p-4"
              >
                <p className="text-base font-semibold text-[#191919]">
                  {item.deceased_name}
                </p>
                {item.funeral_date && (
                  <p className="mt-1 text-xs text-[#666560]">
                    {item.funeral_date}
                    {item.burial_place ? ` • ${item.burial_place}` : ""}
                  </p>
                )}
                {item.message && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#4a4945]">
                    {item.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
