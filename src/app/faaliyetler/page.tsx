import { ActivitiesExplorer } from "@/components/ActivitiesExplorer";
import { getPublishedPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function FaaliyetlerPage() {
  const posts = await getPublishedPosts();
  const activities = posts.filter(
    (p) => p.category === "faaliyet" || p.project_status
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Şeffaflık & Hesap Verebilirlik
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Faaliyet Raporları ve Köy Çalışmaları
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Derneğimizin köyümüzde hayata geçirdiği projeler, devam eden
          çalışmalar ve planlanan faaliyetlerin güncel raporları.
        </p>
      </div>

      <ActivitiesExplorer activities={activities} />
    </div>
  );
}
