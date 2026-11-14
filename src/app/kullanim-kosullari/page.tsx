import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { buildPageMetadata } from "@/lib/seo";
import { getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/kullanim-kosullari", false);
  return buildPageMetadata({
    title: page?.seo_title || "Kullanım Koşulları | Büyük Akören Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî web portalı kullanım koşulları ve görsel lisans ilkeleri.",
    path: "/kullanim-kosullari",
  });
}

export default async function KullanimKosullariPage() {
  return <LegalPageShell slug="/kullanim-kosullari" />;
}
