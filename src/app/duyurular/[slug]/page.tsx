import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, FileDown, MessageSquare } from "lucide-react";
import { ShareWhatsAppButton } from "@/components/ShareWhatsAppButton";
import { CATEGORY_LABELS, STATUS_LABELS, formatDateTR } from "@/lib/format";
import { getAllStoreData, getPostBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "İçerik Bulunamadı | B.Akören" };
  }
  return {
    title: `${post.title} | B.Akören`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.image_url ? [post.image_url] : undefined,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, storeData] = await Promise.all([
    getPostBySlug(slug),
    getAllStoreData(),
  ]);

  if (!post || !post.is_published) {
    notFound();
  }

  const wordCount = post.content.trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const relatedPosts = storeData.posts
    .filter((p) => p.is_published && p.id !== post.id)
    .sort((a, b) => (b.published_at > a.published_at ? 1 : -1))
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-12">
      <Link
        href="/duyurular"
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] sm:border-0 sm:bg-transparent sm:p-0 sm:text-sm sm:text-[#666560]"
      >
        <ArrowLeft className="h-4 w-4" />
        Tüm Duyuru ve Haberlere Dön
      </Link>

      <header className="mt-5 border-b border-[#e6e5e0] pb-6 sm:mt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#666560]">
          <span className="rounded-md bg-[#f4f3ef] px-2.5 py-1 font-medium text-[#191919]">
            {CATEGORY_LABELS[post.category]}
          </span>
          {post.project_status && (
            <span className="rounded-md border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1 font-medium text-[#191919]">
              {STATUS_LABELS[post.project_status]}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTR(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingMinutes} dk okuma
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-[#191919] sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#666560] sm:text-base">
          {post.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <ShareWhatsAppButton title={post.title} />
          {post.attachment_url && (
            <a
              href={post.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#fbfbfa]"
            >
              <FileDown className="h-3.5 w-3.5 text-[#666560]" />
              Ekli Belgeyi İndir
            </a>
          )}
        </div>
      </header>

      {post.image_url && (
        <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] sm:mt-8">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="mt-6 space-y-4 whitespace-pre-line text-[15px] leading-[1.75] text-[#191919] sm:mt-8 sm:text-base sm:leading-relaxed">
        {post.content}
      </div>

      {/* Share & Contact Box */}
      <div className="mt-10 flex flex-col gap-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#191919]">
            Görüş, Soru veya Katkı Bildirimi
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            {storeData.site_settings.association_name} duyuruları hakkında bilgi almak için iletişim kanalımızı kullanabilirsiniz.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ShareWhatsAppButton title={post.title} />
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#191919] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#333333]"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Derneğe Ulaşın
          </Link>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-10 border-t border-[#e6e5e0] pt-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#191919]">
              Diğer Güncel Duyuru ve Haberler
            </h2>
            <Link
              href="/duyurular"
              className="text-xs font-medium text-[#666560] hover:text-[#191919]"
            >
              Tümü →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/duyurular/${rel.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-[#e6e5e0] bg-white p-4 transition-colors hover:border-[#cfcec8] hover:bg-[#fbfbfa]"
              >
                <div>
                  <span className="inline-block rounded bg-[#f4f3ef] px-2 py-0.5 text-[10px] font-medium text-[#191919]">
                    {CATEGORY_LABELS[rel.category]}
                  </span>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-[#191919] group-hover:underline">
                    {rel.title}
                  </h3>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#666560]">
                  <span>{formatDateTR(rel.published_at)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#191919]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
