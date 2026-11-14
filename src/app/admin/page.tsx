import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAdminSession } from "@/lib/auth";
import { getAllStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetici Paneli | Büyük Akören Köyü Derneği",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLogin />;
  }

  const data = await getAllStoreData(true);
  return <AdminDashboard initialData={data} />;
}
