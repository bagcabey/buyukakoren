import { Images } from "lucide-react";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { getAllStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GaleriPage() {
  const data = await getAllStoreData();
  const photos = data.gallery_photos;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[#666560]">
          <Images className="h-3.5 w-3.5" />
          Görsel Arşiv • {photos.length} Fotoğraf
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Fotoğraf Galerisi
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Büyük Akören Köyü manzaraları, okulumuz, dernek faaliyetleri ve
          hemşehri buluşmalarından temizlenmiş ve derlenmiş kareler. Büyütmek
          için fotoğraflara tıklayabilirsiniz.
        </p>
      </div>

      <GalleryLightbox photos={photos} />
    </div>
  );
}
