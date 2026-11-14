import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="rounded-md border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1 text-xs font-medium text-[#666560]">
        404 • Sayfa Bulunamadı
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-[#191919]">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="mt-2 text-sm text-[#666560]">
        Bağlantı değişmiş veya içerik yayından kaldırılmış olabilir. Ana sayfaya
        dönerek güncel duyurulara ulaşabilirsiniz.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333333]"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
