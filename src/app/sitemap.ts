import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllStoreData, getPublishedPosts } from "@/lib/store";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [storeData, posts] = await Promise.all([
    getAllStoreData(false),
    getPublishedPosts(),
  ]);

  const pageMap = new Map(
    (storeData.pages || []).map((p) => [p.slug, p])
  );

  const latestPostDate =
    posts[0]?.updated_at || posts[0]?.published_at || storeData.updated_at || "2026-11-14T00:00:00.000Z";
  const latestCondDate =
    storeData.condolences[0]?.created_at || storeData.updated_at || "2026-11-14T00:00:00.000Z";
  const latestGalDate =
    storeData.gallery_photos[0]?.created_at || storeData.updated_at || "2026-11-14T00:00:00.000Z";

  const staticRoutes: { path: string; lastMod: string; freq: "daily" | "weekly" | "monthly"; prio: number }[] = [
    {
      path: "/",
      lastMod: pageMap.get("/")?.updated_at || latestPostDate,
      freq: "daily",
      prio: 1.0,
    },
    {
      path: "/koyumuz",
      lastMod: pageMap.get("/koyumuz")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "weekly",
      prio: 0.9,
    },
    {
      path: "/duyurular",
      lastMod: latestPostDate,
      freq: "daily",
      prio: 0.9,
    },
    {
      path: "/faaliyetler",
      lastMod: latestPostDate,
      freq: "weekly",
      prio: 0.8,
    },
    {
      path: "/taziye",
      lastMod: latestCondDate,
      freq: "daily",
      prio: 0.85,
    },
    {
      path: "/dernek",
      lastMod: pageMap.get("/dernek")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "weekly",
      prio: 0.8,
    },
    {
      path: "/galeri",
      lastMod: latestGalDate,
      freq: "weekly",
      prio: 0.75,
    },
    {
      path: "/bagis",
      lastMod: pageMap.get("/bagis")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "monthly",
      prio: 0.75,
    },
    {
      path: "/iletisim",
      lastMod: pageMap.get("/iletisim")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "monthly",
      prio: 0.8,
    },
    {
      path: "/kvkk",
      lastMod: pageMap.get("/kvkk")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "monthly",
      prio: 0.4,
    },
    {
      path: "/gizlilik",
      lastMod: pageMap.get("/gizlilik")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "monthly",
      prio: 0.4,
    },
    {
      path: "/kullanim-kosullari",
      lastMod: pageMap.get("/kullanim-kosullari")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "monthly",
      prio: 0.4,
    },
    {
      path: "/kunye",
      lastMod: pageMap.get("/kunye")?.updated_at || "2026-11-14T00:00:00.000Z",
      freq: "monthly",
      prio: 0.4,
    },
  ];

  const knownPaths = new Set(staticRoutes.map((r) => r.path));
  const customPages = (storeData.pages || [])
    .filter((p) => p.status === "published" && !knownPaths.has(p.slug))
    .map((p) => ({
      url: `${SITE_URL}${p.slug.startsWith("/") ? p.slug : `/${p.slug}`}`,
      lastModified: new Date(p.updated_at || "2026-11-14T00:00:00.000Z"),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    lastModified: new Date(r.lastMod),
    changeFrequency: r.freq,
    priority: r.prio,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/duyurular/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at || post.created_at),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticEntries, ...customPages, ...postEntries];
}
