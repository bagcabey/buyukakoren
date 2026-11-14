import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

const BASE_URL = "https://buyukakoren.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/duyurular",
    "/faaliyetler",
    "/taziye",
    "/koyumuz",
    "/dernek",
    "/galeri",
    "/bagis",
    "/iletisim",
  ];

  const posts = await getPublishedPosts();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/duyurular" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/duyurular/${post.slug}`,
    lastModified: new Date(post.published_at || post.created_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
