import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetici Paneli | Büyük Akören Köyü Derneği",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export { default } from "@/app/admin/page";
