import { ProjectStatus } from "./types";

export const CATEGORY_LABELS: Record<string, string> = {
  duyuru: "Duyuru",
  haber: "Haber",
  aciklama: "Resmî Açıklama",
  faaliyet: "Faaliyet Raporu",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planlandi: "Planlandı",
  devam_ediyor: "Devam Ediyor",
  tamamlandi: "Tamamlandı",
};

export function formatDateTR(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Istanbul",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function slugifyTR(text: string): string {
  const map: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] || ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Validates Turkish IBAN format (TR + 24 digits = 26 chars) and ISO 7064 Mod 97-10 checksum.
 */
export function isValidTurkishIban(rawIban: string): boolean {
  const cleaned = rawIban.replace(/\s+/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(cleaned)) {
    return false;
  }
  // Move first 4 chars to end, T=29, R=27
  const rearranged = `${cleaned.slice(4)}2927${cleaned.slice(2, 4)}`;
  let remainder = 0;
  for (let i = 0; i < rearranged.length; i++) {
    const ch = rearranged.charCodeAt(i);
    if (ch < 48 || ch > 57) return false;
    remainder = (remainder * 10 + (ch - 48)) % 97;
  }
  return remainder === 1;
}
