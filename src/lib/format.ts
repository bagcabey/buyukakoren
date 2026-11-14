import { PostCategory, ProjectStatus } from "./types";

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  duyuru: "Duyuru",
  haber: "Haber",
  aciklama: "Resmî Açıklama",
  faaliyet: "Faaliyet Raporu",
};

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
