import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, HeartHandshake, MapPin, MessageSquarePlus } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButtons } from "@/components/ShareButtons";
import { formatDateTR } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";
import { getAllStoreData } from "@/lib/store";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Büyükakören Taziye ve Vefat İlanları | B.Akören",
  description:
    "Sivas Yıldızeli Büyükakören (Büyük Akören) köyü vefat duyuruları, cenaze namazı saatleri, defin yeri ve taziye ilanları.",
  path: "/taziye",
});

export default async function TaziyePage() {
  const data = await getAllStoreData();
  const condolences = data.condolences.filter(
    (c) =>
      c.is_published &&
      c.status !== "archived" &&
      !/örnek|panelden/i.test(c.deceased_name || "")
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="mb-6 hidden border-b border-black pb-3 print:block">
        <p className="text-sm font-bold uppercase tracking-wide">
          {data.site_settings.association_name}
        </p>
        <p className="text-xs text-stone-700">
          Resmî Taziye ve Başsağlığı İlanı — buyukakoren.vercel.app/taziye
        </p>
      </div>
      <Breadcrumbs items={[{ name: "Taziye İlanları", href: "/taziye" }]} />
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#191919] px-3 py-1 text-[11px] font-medium tracking-wide text-white uppercase">
          <HeartHandshake className="h-3.5 w-3.5" />
          Vefat & Başsağlığı İlanları
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Taziye Alanı
        </h1>
        <p className="mt-2 text-sm text-[#666560]">
          Köyümüzden ve gurbetteki hemşehrilerimizden vefat haberleri, cenaze
          vakitleri ve taziye duyuruları.
        </p>
      </div>

      <div className="mt-6 space-y-4 sm:mt-8">
        {condolences.length === 0 ? (
          <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-8 text-center text-sm text-[#666560]">
            Şu anda yayında olan taziye ilanı bulunmamaktadır.
          </div>
        ) : (
          condolences.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#e6e5e0] bg-white p-4 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-[#191919] sm:text-xl">
                    {item.deceased_name}
                  </h2>
                  {item.age_or_note && (
                    <p className="mt-0.5 text-xs text-[#666560] sm:text-sm">
                      {item.age_or_note}
                    </p>
                  )}
                </div>
                <span className="rounded-md bg-[#f4f3ef] px-2.5 py-1 text-xs font-medium text-[#666560]">
                  {formatDateTR(item.created_at)}
                </span>
              </div>

              <div className="mt-4 grid gap-2.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] p-3.5 text-xs sm:grid-cols-2 sm:gap-3 sm:p-4 sm:text-sm">
                <div className="flex items-start gap-2 text-[#191919]">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#666560]" />
                  <span>
                    <strong>Defin / Vakit:</strong> {item.funeral_date}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[#191919]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#666560]" />
                  <span>
                    <strong>Defin Yeri:</strong> {item.burial_place}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#666560]">
                {item.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e5e0] pt-3.5">
                {item.relatives ? (
                  <p className="text-xs font-medium text-[#191919]">
                    İlanı Paylaşan / Yakınları: {item.relatives}
                  </p>
                ) : (
                  <span className="text-xs text-[#666560]">
                    Başsağlığı dileriz
                  </span>
                )}
                <ShareButtons
                  title={`Vefat & Taziye: ${item.deceased_name} (${item.funeral_date} - ${item.burial_place})`}
                  path="/taziye"
                  showPrint
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Taziye Notification Prompt */}
      <div className="no-print mt-8 flex flex-col gap-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#191919]">
            Yeni Taziye Bildirimi İletmek İster misiniz?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            Vefat ve cenaze vakti duyurularını portalda yayımlatmak için İletişim
            sayfasından derneğimize hızlıca bilgi ulaştırabilirsiniz.
          </p>
        </div>
        <Link
          href="/iletisim"
          className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#191919] px-4 py-2 text-xs font-medium text-white hover:bg-[#333333]"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Taziye Bildirimi İlet
        </Link>
      </div>
    </div>
  );
}
