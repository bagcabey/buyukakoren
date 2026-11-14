import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  FileDown,
  MessageSquare,
} from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ShareWhatsAppButton } from "@/components/ShareWhatsAppButton";
import { SmartImage } from "@/components/SmartImage";
import { STATUS_LABELS, formatDateTR, getCategoryLabel } from "@/lib/format";
import { renderSafeRichText, sanitizeSafeUrl } from "@/lib/sanitize";
import { buildNewsArticleJsonLd, buildPageMetadata } from "@/lib/seo";
import { getAllStoreData, getPostBySlugWithRedirect } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPostBySlugWithRedirect(slug, false);
  if (!post || !post.is_published) {
    notFound();
  }
  return buildPageMetadata({
    title: `${post.seo_title || post.title} | B.Akören`,
    description: post.seo_description || post.summary,
    path: `/duyurular/${post.slug}`,
    ogImage: post.image_url,
    type: "article",
  });
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ post, redirectToSlug }, storeData] = await Promise.all([
    getPostBySlugWithRedirect(slug, false),
    getAllStoreData(false),
  ]);

  if (redirectToSlug) {
    permanentRedirect(`/duyurular/${redirectToSlug}`);
  }

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
      <JsonLd data={buildNewsArticleJsonLd(post, storeData.site_settings)} />
      <Breadcrumbs
        items={[
          { name: "Duyuru & Haberler", href: "/duyurular" },
          { name: post.title, href: `/duyurular/${post.slug}` },
        ]}
      />
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
            {getCategoryLabel(post.category)}
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

        <div className="no-print mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <ShareWhatsAppButton title={post.title} />
          {post.attachment_url && (
            <a
              href={post.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#fbfbfa]"
            >
              <FileDown className="h-3.5 w-3.5 text-[#666560]" />
              {post.attachment_name || "Ekli Belgeyi İndir"}
            </a>
          )}
        </div>
      </header>

      {post.image_url && (
        <figure className="mt-6 overflow-hidden rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] sm:mt-8">
          <div className="relative aspect-[16/10] w-full bg-[#f4f3ef]">
            <SmartImage
              src={post.image_url}
              alt={post.image_alt || post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
          {(post.image_attribution?.license ||
            post.image_attribution?.author ||
            post.image_attribution?.source_url) && (
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e6e5e0] px-4 py-2 text-[11px] text-[#666560]">
              <span>
                Görsel Kaynağı:{" "}
                {[
                  post.image_attribution.author,
                  post.image_attribution.license,
                ]
                  .filter(Boolean)
                  .join(" • ") || "Arşiv"}
              </span>
              {(() => {
                const safeSrc = sanitizeSafeUrl(
                  post.image_attribution.source_url || ""
                );
                if (!safeSrc) return null;
                return (
                  <a
                    href={safeSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-[#191919]"
                  >
                    Kaynak Sayfası
                  </a>
                );
              })()}
            </figcaption>
          )}
        </figure>
      )}

      <div
        className="prose-akoren mt-6 space-y-4 text-[15px] leading-[1.75] text-[#191919] sm:mt-8 sm:text-base sm:leading-relaxed [&_a]:font-medium [&_a]:underline [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: renderSafeRichText(post.content) }}
      />

      {Array.isArray(post.extra_images) && post.extra_images.length > 0 && (
        <section className="mt-8 border-t border-[#e6e5e0] pt-6 sm:mt-10">
          <h2 className="text-base font-semibold text-[#191919] sm:text-lg">
            İlgili Görsel Seçkisi
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {post.extra_images.map((item, idx) => {
              const safeSrc = sanitizeSafeUrl(item.source_url || "");
              const safeLic = sanitizeSafeUrl(item.license_url || "");
              return (
                <figure
                  key={`${item.image_url}-${idx}`}
                  className="overflow-hidden rounded-xl border border-[#e6e5e0] bg-white"
                >
                  <div className="relative aspect-[16/10] w-full bg-[#f4f3ef]">
                    <SmartImage
                      src={item.image_url}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 384px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="p-3.5 text-xs">
                    <p className="font-semibold text-[#191919]">{item.title}</p>
                    {item.description && (
                      <p className="mt-1 leading-relaxed text-[#666560]">
                        {item.description}
                      </p>
                    )}
                    {(item.author || item.license || safeSrc) && (
                      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#f0efe9] pt-2 text-[11px] text-[#666560]">
                        <span>
                          {[item.author, item.license].filter(Boolean).join(" • ")}
                        </span>
                        {safeLic && (
                          <a
                            href={safeLic}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#191919]"
                          >
                            Lisans
                          </a>
                        )}
                        {safeSrc && (
                          <a
                            href={safeSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#191919]"
                          >
                            Kaynak
                          </a>
                        )}
                      </p>
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* Share & Contact Box */}
      <div className="no-print mt-10 flex flex-col gap-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#191919]">
            Görüş, Soru veya Katkı Bildirimi
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            {storeData.site_settings.association_name} duyuruları hakkında bilgi
            almak için iletişim kanalımızı kullanabilirsiniz.
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
        <section className="no-print mt-10 border-t border-[#e6e5e0] pt-8">
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
                    {getCategoryLabel(rel.category)}
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
