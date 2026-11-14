import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/kunye", false);
  return {
    title: page?.seo_title || "Kurumsal Künye | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî künye, yönetim kurulu ve portal sorumluluk bilgileri.",
  };
}

export default async function KunyePage() {
  return <LegalPageShell slug="/kunye" showInstitutionalCard />;
}
