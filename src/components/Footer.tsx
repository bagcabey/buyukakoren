import Link from "next/link";
import { Logo } from "./Logo";
import { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-[#e6e5e0] bg-[#fbfbfa] pb-24 lg:pb-10">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-2 sm:px-6 lg:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#666560]">
              {settings.association_name}. Sivas ili Yıldızeli ilçesi
              Büyükakören Köyü sakinleri ve gurbetteki tüm hemşehrilerimiz için
              şeffaf duyuru, faaliyet ve dayanışma portalı.
            </p>
            <div className="mt-4 space-y-1 text-xs text-[#666560]">
              <p>Adres: {settings.association_address || "Büyükakören Köyü, Yıldızeli / Sivas"}</p>
              {settings.show_association_phone && settings.association_phone && (
                <p>Dernek Telefonu: {settings.association_phone}</p>
              )}
              {settings.association_email && (
                <p>E-posta: {settings.association_email}</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
              <Link
                href="/bagis"
                className="inline-flex items-center rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919]"
              >
                Bağış & IBAN →
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#666560]"
              >
                Yönetici Girişi
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#191919]">
              Portal
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#666560]">
              <li>
                <Link href="/duyurular" className="hover:text-[#191919]">
                  Duyuru & Haberler
                </Link>
              </li>
              <li>
                <Link href="/faaliyetler" className="hover:text-[#191919]">
                  Faaliyet Raporları
                </Link>
              </li>
              <li>
                <Link href="/taziye" className="hover:text-[#191919]">
                  Taziye İlanları
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-[#191919]">
                  Fotoğraf Galerisi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#191919]">
              Kurumsal
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#666560]">
              <li>
                <Link href="/koyumuz" className="hover:text-[#191919]">
                  Köyümüz & Tarihçe
                </Link>
              </li>
              <li>
                <Link href="/dernek" className="hover:text-[#191919]">
                  Dernek & Yönetim
                </Link>
              </li>
              <li>
                <Link href="/bagis" className="hover:text-[#191919]">
                  Bağış & Aidat
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-[#191919]">
                  İletişim & Muhtarlık
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#e6e5e0] pt-6 text-xs text-[#666560] sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2.5">
            <p>© {new Date().getFullYear()} B.Akören Köyü Derneği. Tüm hakları saklıdır.</p>
            <span className="hidden text-[#d5d3cc] sm:inline">•</span>
            <p className="text-[11px] text-[#8a8882]">
              Site Yazılımcısı:{" "}
              <a
                href="https://omer-bahcebasi-protfolio-phi-silk-yuvqondwda.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#5c5a54] underline decoration-[#d5d3cc] underline-offset-2 transition-colors hover:text-[#1f4d36] hover:decoration-[#1f4d36]"
              >
                Ömer Bağçabaşı
              </a>
            </p>
          </div>
          <Link href="/admin" className="hover:text-[#191919]">
            Yönetici Girişi →
          </Link>
        </div>
      </div>
    </footer>
  );
}
