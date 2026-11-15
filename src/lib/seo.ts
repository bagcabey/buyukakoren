import type { Metadata } from "next";
import { sanitizeSafeUrl } from "./sanitize";
import { Post, SiteSettings } from "./types";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://buyukakoren.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Büyük Akören Köyü Derneği";

export const DEFAULT_SEO_KEYWORDS = [
  "Büyük Akören",
  "Büyükakören",
  "Büyük Akören Köyü",
  "Büyükakören Köyü Derneği",
  "Büyük Akören Derneği",
  "Sivas Yıldızeli Büyükakören",
  "Yıldızeli Büyük Akören",
  "Sivas Büyükakören köyü",
  "Yıldızeli köyleri",
  "Büyük Akören taziye",
  "Büyükakören vefat haberleri",
  "Büyükakören muhtarlık",
  "Hasan Özüdoğru",
  "Mustafa Tanju Çetiner",
  "Büyük Akören Ortaokulu",
  "Büyükakören posta kodu 58502",
  "Büyükakören nüfusu",
  "Ağören Sivas",
  "Büyük Akviran",
];

export function toAbsoluteUrl(pathOrUrl: string): string {
  const clean = (pathOrUrl || "").trim();
  if (!clean) return SITE_URL;
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${SITE_URL}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

function clampMetaTitle(rawTitle: string): string {
  const clean = rawTitle.trim();
  if (clean.length <= 60) return clean;
  return `${clean.slice(0, 57).trimEnd()}...`;
}

function clampMetaDescription(rawDesc: string): string {
  const clean = rawDesc.trim().replace(/\s+/g, " ");
  if (clean.length <= 155) return clean;
  return `${clean.slice(0, 152).trimEnd()}...`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  type = "website",
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string | null;
  type?: "website" | "article";
  keywords?: string[];
}): Metadata {
  const finalTitle = clampMetaTitle(title);
  const finalDesc = clampMetaDescription(description);
  const canonical = path === "/" ? SITE_URL : toAbsoluteUrl(path);
  const resolvedImage = ogImage?.trim()
    ? toAbsoluteUrl(ogImage.trim())
    : `${SITE_URL}/opengraph-image`;

  return {
    title: finalTitle,
    description: finalDesc,
    keywords: keywords || DEFAULT_SEO_KEYWORDS,
    alternates: {
      canonical,
    },
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: canonical,
      siteName: SITE_NAME,
      locale: "tr_TR",
      type,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDesc,
      images: [resolvedImage],
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; href: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.href === "/" ? SITE_URL : toAbsoluteUrl(item.href),
    })),
  };
}

export function buildOrganizationJsonLd(
  settings: SiteSettings
): Record<string, unknown> {
  const sameAs = Object.values(settings.social_links || {})
    .map((u) => sanitizeSafeUrl(u || ""))
    .filter((u) => u.startsWith("http"));

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": `${SITE_URL}/#organization`,
    name:
      settings.association_name ||
      "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği",
    alternateName: [
      "Büyükakören Köyü Yardımlaşma ve Kalkındırma Derneği",
      "Büyük Akören Köyü Derneği",
      "Büyükakören Derneği",
      "B.Akören Derneği",
    ],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/opengraph-image`,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Büyükakören Köyü, Yıldızeli, Sivas",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress:
        settings.association_address?.trim() || "Büyükakören Köyü",
      addressLocality: "Yıldızeli",
      addressRegion: "Sivas",
      postalCode: "58502",
      addressCountry: "TR",
    },
    founder: {
      "@type": "Person",
      name: "Mustafa Tanju Çetiner",
      jobTitle: "Dernek Başkanı",
    },
  };

  if (settings.show_association_phone && settings.association_phone?.trim()) {
    org.telephone = settings.association_phone.trim();
  }
  if (settings.association_email?.trim()) {
    org.email = settings.association_email.trim();
  }
  if (settings.founded_year?.trim()) {
    org.foundingDate = settings.founded_year.trim();
  }
  if (sameAs.length > 0) {
    org.sameAs = sameAs;
  }

  return org;
}

export function buildWebSiteJsonLd(
  settings: SiteSettings
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.association_name || SITE_NAME,
    alternateName: [
      "B.Akören",
      "Büyükakören Köyü Derneği",
      "B.Akören Köyü Portalı",
      "buyukakoren.vercel.app",
    ],
    url: SITE_URL,
    inLanguage: "tr-TR",
  };
}

export function buildPlaceJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${SITE_URL}/koyumuz#place`,
    name: "Büyükakören (Büyük Akören) Köyü",
    alternateName: [
      "Büyük Akören",
      "Büyükakören",
      "Ağören (1907)",
      "Büyük Akviran (1928)",
    ],
    description:
      "Sivas ili Yıldızeli ilçesine bağlı, 1.276 m rakımlı, 33,8 km² yüzölçümlü, 58502 posta kodlu, 3 geleneksel mahalle (Yukarı, Aşağı, Şeyhler) ve 3 camiye sahip köklü Anadolu köyü.",
    url: `${SITE_URL}/koyumuz`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: 39.603056,
      longitude: 36.438056,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Büyükakören, Yıldızeli",
      addressRegion: "Sivas",
      postalCode: "58502",
      addressCountry: "TR",
    },
    containsPlace: [
      {
        "@type": "Place",
        name: "Büyükakören Merkez Camii",
      },
      {
        "@type": "MiddleSchool",
        name: "Büyük Akören Ortaokulu",
        telephone: "+90-346-753-1122",
        url: "https://buyukakorenoo.meb.k12.tr",
      },
    ],
  };
}

export function buildEducationalOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "MiddleSchool",
    name: "Büyük Akören Ortaokulu",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Büyük Akören Köyü",
      addressLocality: "Yıldızeli",
      addressRegion: "Sivas",
      postalCode: "58502",
      addressCountry: "TR",
    },
    telephone: "+90-346-753-1122",
    url: "https://buyukakorenoo.meb.k12.tr",
  };
}

export function buildNewsArticleJsonLd(
  post: Post,
  settings: SiteSettings
): Record<string, unknown> {
  const url = `${SITE_URL}/duyurular/${post.slug}`;
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.seo_title || post.title,
    description: post.seo_description || post.summary,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    inLanguage: "tr-TR",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Organization",
      name: settings.association_name || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: settings.association_name || SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
  };

  if (post.image_url?.trim()) {
    article.image = [toAbsoluteUrl(post.image_url.trim())];
  }

  return article;
}

export function buildContactPageJsonLd(
  settings: SiteSettings
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `İletişim ve Muhtarlık Bilgileri | ${settings.association_name || SITE_NAME}`,
    description:
      "Büyük Akören Köyü Derneği mesajlaşma formu, Köy Muhtarı Hasan Özüdoğru (Tel: 0536 722 16 07) ve Büyük Akören Ortaokulu (Tel: 0346 753 11 22) resmî erişim bilgileri.",
    url: `${SITE_URL}/iletisim`,
    mainEntity: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}
