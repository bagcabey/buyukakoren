import { Condolence } from "./types";

/** Boş, yalnız boşluk ya da tanımsız alanı null'a çevirir; ekranda ve paylaşımda "undefined" çıkmaz. */
export function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed !== "undefined" && trimmed !== "null" ? trimmed : null;
}

/** Kayıttaki isteğe bağlı alanları tek biçime getirir (eski kayıtlar dahil). */
export function normalizeCondolence(c: Condolence): Condolence {
  return {
    ...c,
    deceased_name: cleanText(c.deceased_name) ?? "",
    age_or_note: cleanText(c.age_or_note),
    funeral_date: cleanText(c.funeral_date) ?? "",
    burial_place: cleanText(c.burial_place),
    message: cleanText(c.message) ?? "",
    relatives: cleanText(c.relatives),
  };
}

/** Paylaşım başlığı: yalnız dolu alanlardan kurulur. */
export function condolenceShareTitle(c: Condolence): string {
  const details = [cleanText(c.funeral_date), cleanText(c.burial_place)].filter(Boolean);
  const name = cleanText(c.deceased_name) ?? "";
  return details.length > 0
    ? `Vefat & Taziye: ${name} (${details.join(" - ")})`
    : `Vefat & Taziye: ${name}`;
}
