import type { Metadata } from "next";
import { ActivitiesExplorer } from "@/components/ActivitiesExplorer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/store";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Büyükakören Faaliyet Raporları | B.Akören",
  description:
    "Büyük Akören Köyü Derneği tarafından Yıldızeli Büyükakören'de tamamlanan ve devam eden köy projeleri ile faaliyet raporları.",
  path: "/faaliyetler",
});

export default async function FaaliyetlerPage() {
  const posts = await getPublishedPosts();
  const activities = posts.filter(
    (p) => p.category === "faaliyet" || p.project_status
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ name: "Faaliyet Raporları", href: "/faaliyetler" }]} />
      <div className="rounded-2xl border border-indigo-200/80 border-l-4 border-l-indigo-700 bg-gradient-to-r from-indigo-50/70 via-white to-[#f8f9fc] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-indigo-700 px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
            Bölüm • Faaliyet Raporları
          </span>
          <span className="text-xs font-medium tracking-wider text-[#666560] uppercase">
            Şeffaflık & Hesap Verebilirlik
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#191919] sm:text-3xl">
          Faaliyet Raporları ve Köy Çalışmaları
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#44433f]">
          Derneğimizin Büyükakören köyümüzde hayata geçirdiği projeler, devam
          eden çalışmalar ve planlanan faaliyetlerin güncel raporları.
        </p>
      </div>

      <ActivitiesExplorer activities={activities} />
    </div>
  );
}
