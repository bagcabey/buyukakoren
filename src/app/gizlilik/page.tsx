import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { buildPageMetadata } from "@/lib/seo";
import { getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/gizlilik", false);
  return buildPageMetadata({
    title:
      page?.seo_title ||
      "Gizlilik ve Çerez Politikası | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "Büyük Akören Köyü Derneği web portalında yalnızca zorunlu güvenlik oturum çerezi kullanıldığına ve ziyaretçi gizliliğine ilişkin politika.",
    path: "/gizlilik",
  });
}

export default async function GizlilikPage() {
  return <LegalPageShell slug="/gizlilik" />;
}
