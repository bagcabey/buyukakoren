import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Camera, Images } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { buildPageMetadata } from "@/lib/seo";
import { getAllStoreData } from "@/lib/store";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Fotoğraf Galerisi | Yıldızeli ve Sivas Arşivi | B.Akören",
  description:
    "Sivas, Yıldızeli ve Büyükakören çevresinden lisanslı doğa, tarih, kültür ve kırsal yaşam fotoğrafları.",
  path: "/galeri",
});

export default async function GaleriPage() {
  const data = await getAllStoreData();
  const photos = data.gallery_photos;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ name: "Fotoğraf Galerisi", href: "/galeri" }]} />
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-teal-200/80 border-l-4 border-l-teal-700 bg-gradient-to-r from-teal-50/70 via-white to-[#f7fbfa] p-5 sm:flex-row sm:items-end sm:p-7">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-800 px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
              <Images className="h-3.5 w-3.5" />
              Bölüm • Fotoğraf Galerisi
            </span>
            <span className="text-xs font-medium tracking-wider text-[#666560] uppercase">
              Görsel Arşiv • {photos.length} Fotoğraf
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#191919] sm:text-3xl">
            Fotoğraf Galerisi
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#44433f]">
            Yıldızeli bölgesi, Sivas tarih-kültür durakları, kırsal yaşam ve
            millî mirasımızdan açık lisanslı görseller. Büyütmek ve yazar/lisans
            bilgisini incelemek için fotoğraflara tıklayabilirsiniz.
          </p>
        </div>
        <Link
          href="/iletisim"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-3.5 py-2 text-xs font-semibold text-teal-950 transition-colors hover:bg-teal-50"
        >
          <Camera className="h-3.5 w-3.5 text-teal-700" />
          Köyümüzden Fotoğraf Gönderin
        </Link>
      </div>

      <GalleryLightbox photos={photos} />

      <section className="mt-10 rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-red-800 uppercase">
              Köy Arşivi Katkısı
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#191919] sm:text-xl">
              Köyümüzden Fotoğraf Gönderin
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#666560]">
              Bu galerideki doğa ve bölge görselleri Wikimedia Commons&apos;taki
              açık lisanslı Yıldızeli ve Sivas arşivinden derlenmiştir.
              Doğrudan Büyükakören köyümüze ait eski veya yeni fotoğraflarınızı
              (yazar/çekim yılı notuyla) paylaşarak arşivimizi zenginleştirebilirsiniz.
            </p>
          </div>
          <Link
            href="/iletisim"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg bg-[#191919] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333333]"
          >
            Fotoğraf İletmek İçin Yazın
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
