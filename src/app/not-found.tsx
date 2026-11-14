import Link from "next/link";
import { ArrowLeft, MapPin, Megaphone, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <span className="rounded-md border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1 text-xs font-medium text-[#666560]">
        404 • Sayfa Bulunamadı
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-[#191919] sm:text-3xl">
        Aradığınız sayfa bulunamadı
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#666560]">
        Bağlantı değişmiş veya içerik yayından kaldırılmış olabilir. Aşağıdaki
        bağlantılardan Büyük Akören Köyü Derneği portalına devam edebilirsiniz.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333333]"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana Sayfaya Dön
        </Link>
        <Link
          href="/duyurular"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#e6e5e0] bg-white px-4 py-2.5 text-sm font-medium text-[#191919] hover:bg-[#fbfbfa]"
        >
          <Megaphone className="h-4 w-4 text-[#666560]" />
          Duyurular
        </Link>
        <Link
          href="/koyumuz"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#e6e5e0] bg-white px-4 py-2.5 text-sm font-medium text-[#191919] hover:bg-[#fbfbfa]"
        >
          <MapPin className="h-4 w-4 text-[#666560]" />
          Köyümüz
        </Link>
        <Link
          href="/iletisim"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#e6e5e0] bg-white px-4 py-2.5 text-sm font-medium text-[#191919] hover:bg-[#fbfbfa]"
        >
          <Phone className="h-4 w-4 text-[#666560]" />
          İletişim
        </Link>
      </div>
    </div>
  );
}
