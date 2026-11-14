import type { Metadata } from "next";
import { LegalPageShell } from "@/components/LegalPageShell";
import { getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("/kvkk", false);
  return {
    title: page?.seo_title || "KVKK Aydınlatma Metni | Büyük Akören Köyü Derneği",
    description:
      page?.seo_description ||
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Büyük Akören Köyü Derneği kişisel veri işleme, aktarım ve saklama ilkeleri.",
  };
}

export default async function KvkkPage() {
  return <LegalPageShell slug="/kvkk" />;
}
