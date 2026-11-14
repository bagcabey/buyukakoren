import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { buildPageMetadata } from "@/lib/seo";
import { getPageBySlug } from "@/lib/store";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/kvkk", false);
  return buildPageMetadata({
    title: page?.seo_title || "KVKK Aydınlatma Metni | B.Akören Derneği",
    description:
      page?.seo_description ||
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Büyük Akören Köyü Derneği kişisel veri işleme, aktarım ve saklama ilkeleri.",
    path: "/kvkk",
  });
}

export default async function KvkkPage() {
  return <LegalPageShell slug="/kvkk" />;
}
