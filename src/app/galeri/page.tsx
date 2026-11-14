import type { Metadata } from "next";
import { Images } from "lucide-react";
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
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#666560]">
          <Images className="h-3.5 w-3.5" />
          Görsel Arşiv • {photos.length} Fotoğraf
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Fotoğraf Galerisi
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Yıldızeli bölgesi, Sivas tarih-kültür durakları ve dernek arşivinden
          lisanslı görseller. Büyütmek ve kaynak bilgisini görmek için
          fotoğraflara tıklayabilirsiniz.
        </p>
      </div>

      <GalleryLightbox photos={photos} />
    </div>
  );
}
