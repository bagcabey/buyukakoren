import { renderSafeRichText } from "@/lib/sanitize";
import { ContactForm } from "./ContactForm";
import { CopyIbanButton } from "./CopyIbanButton";
import { GalleryLightbox } from "./GalleryLightbox";
import { formatDateTR, getCategoryLabel, isValidTurkishIban, STATUS_LABELS } from "@/lib/format";
import { PageBlock, PageConfig, Post, StoreData } from "@/lib/types";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";

interface PageBlocksRendererProps {
  page: PageConfig;
  storeData: StoreData;
  isDonatePage?: boolean;
}

function asString(val: unknown, fallback = ""): string {
  return typeof val === "string" ? val : fallback;
}

function asNumber(val: unknown, fallback: number): number {
  return typeof val === "number" && !Number.isNaN(val) ? val : fallback;
}

function asArray<T = Record<string, unknown>>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

function asStringArray(val: unknown): string[] {
  return Array.isArray(val)
    ? val.filter((x): x is string => typeof x === "string")
    : [];
}

export function PageBlocksRenderer({
  page,
  storeData,
  isDonatePage = false,
}: PageBlocksRendererProps) {
  const orderedBlocks = [...(page.blocks || [])]
    .filter((b) => b.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const { site_settings: settings, board_members: boardMembers } = storeData;

  return (
    <div className="space-y-12 sm:space-y-16">
      {orderedBlocks.map((block) => (
        <BlockSection
          key={block.id}
          block={block}
          storeData={storeData}
          settings={settings}
          boardMembers={boardMembers}
          isDonatePage={isDonatePage}
        />
      ))}
    </div>
  );
}

function BlockSection({
  block,
  storeData,
  settings,
  boardMembers,
  isDonatePage,
}: {
  block: PageBlock;
  storeData: StoreData;
  settings: StoreData["site_settings"];
  boardMembers: StoreData["board_members"];
  isDonatePage: boolean;
}) {
  const d = block.data || {};

  switch (block.type) {
    case "hero": {
      const badge = asString(d.badge);
      const title = asString(d.title);
      const subtitle = asString(d.subtitle);
      const imageUrl = asString(d.image_url);
      const imageAlt = asString(d.image_alt, title);
      const primaryLabel = asString(d.primary_label);
      const primaryHref = asString(d.primary_href);
      const secondaryLabel = asString(d.secondary_label);
      const secondaryHref = asString(d.secondary_href);

      return (
        <section className="relative overflow-hidden rounded-2xl border border-[#e6e5e0] bg-[#191919] text-white shadow-sm">
          {imageUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#191919] via-[#191919]/75 to-[#191919]/50" />
            </>
          )}
          <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-stone-100 backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-red-400" />
                {badge}
              </span>
            )}
            <h1 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200 sm:text-base">
                {subtitle}
              </p>
            )}
            {(primaryLabel || secondaryLabel) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {primaryLabel && primaryHref && (
                  <Link
                    href={primaryHref}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
                  >
                    {primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                {secondaryLabel && secondaryHref && (
                  <Link
                    href={secondaryHref}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    {secondaryLabel}
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    case "stats": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title);
      const subtitle = asString(d.subtitle);
      const items = asArray<{
        id?: string;
        label: string;
        value: string;
        subtext?: string;
      }>(d.items);

      return (
        <section>
          {(eyebrow || title) && (
            <div className="mb-5">
              {eyebrow && (
                <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[#191919] sm:text-2xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-xs text-[#666560]">{subtitle}</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-xl border border-[#e6e5e0] bg-white p-5 transition hover:border-[#cfcec8]"
              >
                <p className="text-xs font-medium text-[#666560]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[#191919]">
                  {item.value}
                </p>
                {item.subtext && (
                  <p className="mt-1 text-xs text-[#666560]">{item.subtext}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "rich_text": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title);
      const content = asString(d.content);
      const sourceNote = asString(d.source_note);
      const html = renderSafeRichText(content);

      return (
        <section className="rounded-2xl border border-[#e6e5e0] bg-white p-6 sm:p-8 lg:p-10">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#191919] sm:text-2xl">
              {title}
            </h2>
          )}
          <div
            className="prose prose-stone mt-5 max-w-none text-sm leading-relaxed text-[#2e2d2a] sm:text-base [&_a]:text-red-800 [&_a]:underline [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#191919] [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {sourceNote && (
            <p className="mt-6 border-t border-[#e6e5e0] pt-4 text-xs text-[#666560]">
              {sourceNote}
            </p>
          )}
        </section>
      );
    }

    case "image": {
      const imageUrl = asString(d.image_url);
      if (!imageUrl) return null;
      const alt = asString(
        d.alt,
        asString(d.caption, settings.association_name)
      );
      const caption = asString(d.caption);
      const attribution = asString(d.attribution);

      return (
        <figure className="overflow-hidden rounded-2xl border border-[#e6e5e0] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="max-h-[540px] w-full object-cover"
          />
          {(caption || attribution) && (
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e6e5e0] px-5 py-3 text-xs text-[#666560]">
              <span>{caption}</span>
              {attribution && <span className="font-medium">{attribution}</span>}
            </figcaption>
          )}
        </figure>
      );
    }

    case "image_text": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title);
      const text = asString(d.text);
      const imageUrl = asString(d.image_url);
      const imageAlt = asString(d.image_alt, title);
      const imagePosition = asString(d.image_position, "left");
      const bullets = asStringArray(d.bullets);
      const ctaLabel = asString(d.cta_label);
      const ctaHref = asString(d.cta_href);
      const html = renderSafeRichText(text);

      return (
        <section className="overflow-hidden rounded-2xl border border-[#e6e5e0] bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {imageUrl && (
              <div
                className={`relative min-h-[240px] bg-stone-100 lg:col-span-5 ${
                  imagePosition === "right" ? "lg:order-2" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div
              className={`p-6 sm:p-8 lg:p-10 ${
                imageUrl ? "lg:col-span-7" : "lg:col-span-12"
              }`}
            >
              {eyebrow && (
                <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[#191919] sm:text-2xl">
                  {title}
                </h2>
              )}
              <div
                className="mt-4 space-y-3 text-sm leading-relaxed text-[#4a4945] sm:text-base [&_p]:mb-2"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              {bullets.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[#191919]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {ctaLabel && ctaHref && (
                <div className="mt-6">
                  <Link
                    href={ctaHref}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#333333]"
                  >
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "card_grid": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title);
      const subtitle = asString(d.subtitle);
      const cols = asNumber(d.columns, 3);
      const cards = asArray<{
        id?: string;
        badge?: string;
        title: string;
        description?: string;
        image_url?: string;
        link_label?: string;
        link_href?: string;
      }>(d.cards);

      const gridClass =
        cols === 2
          ? "sm:grid-cols-2"
          : cols === 4
            ? "sm:grid-cols-2 lg:grid-cols-4"
            : "sm:grid-cols-2 lg:grid-cols-3";

      return (
        <section>
          {(eyebrow || title) && (
            <div className="mb-5">
              {eyebrow && (
                <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[#191919] sm:text-2xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-[#666560]">{subtitle}</p>
              )}
            </div>
          )}
          <div className={`grid grid-cols-1 gap-5 ${gridClass}`}>
            {cards.map((card, i) => {
              const isExternal = card.link_href?.startsWith("http");
              return (
                <div
                  key={card.id || i}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-[#e6e5e0] bg-white p-6 transition hover:border-[#cfcec8]"
                >
                  <div>
                    {card.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={card.image_url}
                        alt={card.title}
                        className="mb-4 h-40 w-full rounded-lg object-cover"
                      />
                    )}
                    {card.badge && (
                      <span className="inline-block rounded-md bg-[#f4f3ef] px-2.5 py-1 text-[11px] font-semibold text-[#191919]">
                        {card.badge}
                      </span>
                    )}
                    <h3 className="mt-3 text-base font-bold text-[#191919]">
                      {card.title}
                    </h3>
                    {card.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[#666560]">
                        {card.description}
                      </p>
                    )}
                  </div>
                  {card.link_label && card.link_href && (
                    <div className="mt-4 pt-3">
                      {isExternal ? (
                        <a
                          href={card.link_href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-800 hover:text-red-950"
                        >
                          {card.link_label}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <Link
                          href={card.link_href}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#191919] hover:underline"
                        >
                          {card.link_label}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    case "timeline": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title);
      const description = asString(d.description);
      const items = asArray<{
        id?: string;
        year: string;
        value: string;
        note?: string;
        highlight?: boolean;
      }>(d.items);

      return (
        <section className="rounded-2xl border border-[#e6e5e0] bg-white p-6 sm:p-8">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#191919] sm:text-2xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1.5 text-sm text-[#666560]">{description}</p>
          )}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((row, idx) => (
              <div
                key={row.id || idx}
                className={`rounded-xl border p-4 ${
                  row.highlight
                    ? "border-red-200 bg-red-50/60"
                    : "border-[#e6e5e0] bg-[#fbfbfa]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-[#191919]">
                    {row.year}
                  </span>
                  <span className="text-lg font-bold text-red-800">
                    {row.value}
                  </span>
                </div>
                {row.note && (
                  <p className="mt-1 text-xs text-[#666560]">{row.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "latest_posts": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title, "Güncel Duyuru ve Haberler");
      const limit = asNumber(d.limit, 6);
      const category = asString(d.category, "all");
      const moreLabel = asString(d.more_label, "Tümünü Gör");
      const moreHref = asString(d.more_href, "/duyurular");

      const posts: Post[] = (storeData.posts || [])
        .filter((p) =>
          category === "all" || !category ? true : p.category === category
        )
        .slice(0, limit);

      return (
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              {eyebrow && (
                <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
                  {eyebrow}
                </p>
              )}
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#191919] sm:text-2xl">
                {title}
              </h2>
            </div>
            <Link
              href={moreHref}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#191919] hover:underline"
            >
              {moreLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-8 text-center text-sm text-[#666560]">
              Henüz yayınlanmış duyuru veya haber bulunmamaktadır.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/duyurular/${post.slug}`}
                  className="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#e6e5e0] bg-white transition hover:border-[#cfcec8] hover:shadow-sm"
                >
                  <div>
                    {post.image_url && (
                      <div className="aspect-[16/9] w-full overflow-hidden bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image_url}
                          alt={post.image_alt || post.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#666560]">
                        <span className="rounded bg-[#f4f3ef] px-2 py-0.5 font-semibold text-[#191919]">
                          {getCategoryLabel(post.category)}
                        </span>
                        {post.project_status && (
                          <span className="rounded border border-[#e6e5e0] px-2 py-0.5 font-medium">
                            {STATUS_LABELS[post.project_status]}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 line-clamp-2 text-base font-bold text-[#191919] group-hover:underline">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-[#666560]">
                        {post.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e6e5e0] px-5 py-3 text-xs text-[#666560]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateTR(post.published_at)}
                    </span>
                    <span className="font-semibold text-[#191919]">
                      Oku →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      );
    }

    case "gallery_preview": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title, "Fotoğraf Galerisi");
      const limit = asNumber(d.limit, 6);
      const album = asString(d.album, "Tümü");
      const moreLabel = asString(d.more_label, "Galeriyi Aç");
      const moreHref = asString(d.more_href, "/galeri");

      const photos = (storeData.gallery_photos || [])
        .filter((g) => (album === "Tümü" || !album ? true : g.album === album))
        .slice(0, limit);

      if (photos.length === 0) return null;

      return (
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              {eyebrow && (
                <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
                  {eyebrow}
                </p>
              )}
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#191919] sm:text-2xl">
                {title}
              </h2>
            </div>
            <Link
              href={moreHref}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#191919] hover:underline"
            >
              {moreLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <GalleryLightbox photos={photos} />
        </section>
      );
    }

    case "cta": {
      const theme = asString(d.theme, "dark");
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title);
      const description = asString(d.description);
      const primaryLabel = asString(d.primary_label);
      const primaryHref = asString(d.primary_href);
      const secondaryLabel = asString(d.secondary_label);
      const secondaryHref = asString(d.secondary_href);

      const wrapperClass =
        theme === "red"
          ? "bg-red-800 text-white border-red-900"
          : theme === "light"
            ? "bg-[#fbfbfa] text-[#191919] border-[#e6e5e0]"
            : "bg-[#191919] text-white border-[#191919]";

      const descClass =
        theme === "light" ? "text-[#666560]" : "text-stone-200";

      return (
        <section className={`rounded-2xl border p-7 sm:p-10 ${wrapperClass}`}>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              {eyebrow && (
                <p
                  className={`text-xs font-semibold tracking-wider uppercase ${
                    theme === "light" ? "text-red-800" : "text-red-300"
                  }`}
                >
                  {eyebrow}
                </p>
              )}
              <h2 className="mt-1.5 text-xl font-bold sm:text-2xl">{title}</h2>
              {description && (
                <p className={`mt-2 text-sm leading-relaxed ${descClass}`}>
                  {description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              {primaryLabel && primaryHref && (
                <Link
                  href={primaryHref}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                    theme === "light"
                      ? "bg-[#191919] text-white hover:bg-[#333333]"
                      : "bg-white text-[#191919] hover:bg-stone-100"
                  }`}
                >
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {secondaryLabel && secondaryHref && (
                <Link
                  href={secondaryHref}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                    theme === "light"
                      ? "border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
                      : "border-white/25 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const eyebrow = asString(d.eyebrow);
      const title = asString(d.title, "Sıkça Sorulan Sorular");
      const items = asArray<{ id?: string; question: string; answer: string }>(
        d.items
      );

      if (items.length === 0) return null;

      return (
        <section className="rounded-2xl border border-[#e6e5e0] bg-white p-6 sm:p-8">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-xl font-bold text-[#191919] sm:text-2xl">
            {title}
          </h2>
          <div className="mt-6 divide-y divide-[#e6e5e0]">
            {items.map((item, i) => (
              <details key={item.id || i} className="group py-4" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#191919] sm:text-base">
                  <span>{item.question}</span>
                  <span className="text-lg text-[#666560] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-[#666560]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      );
    }

    case "iban_card": {
      const rawIban = settings.iban_number?.trim() || "";
      const iban =
        rawIban && isValidTurkishIban(rawIban) && !/^TR00/i.test(rawIban.replace(/\s+/g, ""))
          ? rawIban
          : "";
      const rawBank = settings.iban_bank?.trim() || "";
      const bank = rawBank.toLowerCase().includes("panelden") ? "" : rawBank;
      const accountName = settings.iban_account_name?.trim() || "";
      const note = settings.donation_note?.trim() || "";
      const eyebrow = asString(d.eyebrow, "Bağış ve Aidat");
      const title = asString(d.title, "Resmî Banka Hesap Bilgileri");
      const description = asString(d.description);

      // Ana sayfada IBAN tanımlı değilse bu bölüm tamamen gizlenir
      if (!iban && !isDonatePage) {
        return null;
      }

      if (!iban && isDonatePage) {
        return (
          <section className="rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e6e5e0] bg-white text-[#191919]">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#191919]">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#4a4945]">
                  Bağış bilgileri yakında paylaşılacaktır; dernek yönetimiyle{" "}
                  <Link href="/iletisim" className="font-semibold underline">
                    iletişim sayfasından
                  </Link>{" "}
                  doğrudan irtibata geçebilirsiniz.
                </p>
              </div>
            </div>
          </section>
        );
      }

      return (
        <section className="rounded-2xl border border-[#e6e5e0] bg-white p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              {eyebrow && (
                <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
                  {eyebrow}
                </p>
              )}
              <h2 className="mt-1 text-xl font-bold text-[#191919] sm:text-2xl">
                {title}
              </h2>
              {description && (
                <p className="mt-2 max-w-xl text-sm text-[#666560]">
                  {description}
                </p>
              )}
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {bank && (
                  <div className="rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] p-3">
                    <dt className="text-xs text-[#666560]">Banka Adı</dt>
                    <dd className="mt-0.5 font-semibold text-[#191919]">
                      {bank}
                    </dd>
                  </div>
                )}
                {accountName && (
                  <div className="rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] p-3">
                    <dt className="text-xs text-[#666560]">Hesap Sahibi</dt>
                    <dd className="mt-0.5 font-semibold text-[#191919]">
                      {accountName}
                    </dd>
                  </div>
                )}
              </dl>
              {note && (
                <p className="mt-3 text-xs leading-relaxed text-[#666560]">
                  {note}
                </p>
              )}
            </div>
            <div className="shrink-0 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
              <p className="text-xs font-medium text-[#666560]">
                TR IBAN Numarası
              </p>
              <p className="mt-1.5 font-mono text-sm font-bold tracking-wider text-[#191919] sm:text-base">
                {iban}
              </p>
              <div className="mt-3">
                <CopyIbanButton iban={iban} />
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "board_members": {
      const validMembers = (boardMembers || [])
        .filter(
          (m) =>
            m.full_name &&
            m.full_name.trim() !== "" &&
            !m.full_name.toLowerCase().includes("panelden")
        )
        .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99));

      if (validMembers.length === 0) {
        return null;
      }

      const eyebrow = asString(d.eyebrow, "Yönetim");
      const title = asString(d.title, "Yönetim Kurulu");
      const description = asString(d.description);

      return (
        <section className="rounded-2xl border border-[#e6e5e0] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-red-800 uppercase">
            <Users className="h-4 w-4" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-[#191919] sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-sm text-[#666560]">{description}</p>
          )}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {validMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5"
              >
                <span className="inline-block rounded bg-white px-2.5 py-0.5 text-xs font-semibold text-red-800 ring-1 ring-[#e6e5e0]">
                  {member.role}
                </span>
                <h3 className="mt-2.5 text-base font-bold text-[#191919]">
                  {member.full_name}
                </h3>
                {member.bio && (
                  <p className="mt-1 text-xs leading-relaxed text-[#666560]">
                    {member.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "contact_card": {
      const title = asString(d.title, "İletişim Bilgileri & Mesaj Formu");
      const description = asString(d.description);
      const showForm = d.show_form !== false;

      const phone =
        settings.show_association_phone && settings.association_phone?.trim()
          ? settings.association_phone.trim()
          : "";
      const email =
        settings.association_email &&
        !settings.association_email.includes("buyukakoren.org")
          ? settings.association_email.trim()
          : "";
      const mukhtarPhone = settings.mukhtar_phone?.trim() || "";
      const mukhtarName = settings.mukhtar_name?.trim() || "";

      return (
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-[#e6e5e0] bg-white p-6">
              <h2 className="text-lg font-bold text-[#191919]">{title}</h2>
              {description && (
                <p className="mt-1.5 text-sm text-[#666560]">{description}</p>
              )}

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
                  <div>
                    <p className="font-semibold text-[#191919]">Yerleşim / Merkez</p>
                    <p className="text-[#666560]">
                      {settings.association_address ||
                        "Büyükakören Köyü, Yıldızeli / Sivas PK: 58502"}
                    </p>
                  </div>
                </div>

                {phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
                    <div>
                      <p className="font-semibold text-[#191919]">
                        Dernek Telefonu
                      </p>
                      <a
                        href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                        className="text-[#666560] hover:text-[#191919] hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
                    <div>
                      <p className="font-semibold text-[#191919]">E-posta</p>
                      <a
                        href={`mailto:${email}`}
                        className="text-[#666560] hover:text-[#191919] hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-red-800" />
                  <div>
                    <p className="font-semibold text-[#191919]">
                      Köy Muhtarlığı
                    </p>
                    <p className="text-[#666560]">
                      Büyükakören Köyü Muhtarlığı — Yıldızeli / Sivas
                    </p>
                    {mukhtarName && (
                      <p className="mt-0.5 font-medium text-[#191919]">
                        Muhtar: {mukhtarName}
                      </p>
                    )}
                    {mukhtarPhone && (
                      <a
                        href={`tel:${mukhtarPhone.replace(/[^+\d]/g, "")}`}
                        className="mt-0.5 inline-block text-[#191919] hover:underline"
                      >
                        {mukhtarPhone}
                      </a>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <a
                        href="https://www.yildizeli.gov.tr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1 font-medium text-[#191919] hover:bg-[#f4f3ef]"
                      >
                        Yıldızeli Kaymakamlığı
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href="https://www.sivas.gov.tr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1 font-medium text-[#191919] hover:bg-[#f4f3ef]"
                      >
                        Sivas Valiliği
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="rounded-2xl border border-[#e6e5e0] bg-white p-6 sm:p-8 lg:col-span-7">
              <h3 className="mb-4 text-base font-bold text-[#191919]">
                Yönetime Doğrudan Mesaj Gönderin
              </h3>
              <ContactForm />
            </div>
          )}
        </section>
      );
    }

    case "map": {
      const title = asString(d.title, "Konum Haritası");
      const description = asString(d.description);
      const lat = asNumber(d.lat, 39.603056);
      const lng = asNumber(d.lng, 36.438056);
      const bboxDelta = 0.04;
      const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - bboxDelta}%2C${lat - bboxDelta}%2C${lng + bboxDelta}%2C${lat + bboxDelta}&layer=mapnik&marker=${lat}%2C${lng}`;
      const googleUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;

      return (
        <section className="overflow-hidden rounded-2xl border border-[#e6e5e0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e5e0] p-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#191919]">{title}</h2>
              {description && (
                <p className="mt-1 text-xs text-[#666560]">{description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
              >
                Google Haritalar&apos;da Aç
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <a
                href={osmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
              >
                OpenStreetMap
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="h-[340px] w-full bg-stone-100 sm:h-[400px]">
            <iframe
              title={title}
              src={osmEmbed}
              className="h-full w-full border-0"
              loading="lazy"
            />
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
