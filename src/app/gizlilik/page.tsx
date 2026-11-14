import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/gizlilik", false);
  return {
    title: page?.seo_title || "Gizlilik ve Çerez Politikası | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Derneği web portalında yalnızca zorunlu güvenlik oturum çerezi kullanıldığına ve ziyaretçi gizliliğine ilişkin politika.",
  };
}

export default async function GizlilikPage() {
  return <LegalPageShell slug="/gizlilik" />;
}
