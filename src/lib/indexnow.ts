import { SITE_URL } from "./seo";

export const INDEXNOW_KEY = "b8a58502buyukakoren2026indexnow";
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

/**
 * Bing, Yandex ve IndexNow destekli arama motorlarına yeni veya güncellenmiş
 * sayfaları anlık olarak bildirir. Hata durumunda yayımlama akışını bloklamaz.
 */
export async function notifyIndexNow(relativePaths: string[]): Promise<void> {
  try {
    const host = new URL(SITE_URL).host;
    const urlList = Array.from(
      new Set(
        relativePaths
          .map((p) => (p.startsWith("http") ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`))
          .filter(Boolean)
      )
    );

    if (urlList.length === 0) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host,
          key: INDEXNOW_KEY,
          keyLocation: INDEXNOW_KEY_LOCATION,
          urlList,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    console.warn("[indexnow] Bildirim atlandı:", (err as Error).message);
  }
}
