import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/kullanim-kosullari", false);
  return {
    title: page?.seo_title || "Kullanım Koşulları | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî web portalı kullanım koşulları ve görsel lisans ilkeleri.",
  };
}

export default async function KullanimKosullariPage() {
  return <LegalPageShell slug="/kullanim-kosullari" />;
}
