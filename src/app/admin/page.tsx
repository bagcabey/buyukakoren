import { isAdminAuthenticated } from "@/lib/auth";
import { getAllStoreData } from "@/lib/store";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLogin />;
  }

  const data = await getAllStoreData();
  return <AdminDashboard initialData={data} />;
}
