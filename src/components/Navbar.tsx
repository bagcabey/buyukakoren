"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  FileCheck2,
  HeartHandshake,
  Home,
  Images,
  Landmark,
  MapPin,
  Megaphone,
  Menu,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo, TurkishFlagSvg } from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/duyurular", label: "Duyuru & Haberler" },
  { href: "/faaliyetler", label: "Faaliyetler" },
  { href: "/taziye", label: "Taziye" },
  { href: "/koyumuz", label: "Köyümüz" },
  { href: "/dernek", label: "Derneğimiz" },
  { href: "/galeri", label: "Galeri" },
  { href: "/bagis", label: "Bağış" },
  { href: "/iletisim", label: "İletişim" },
];

const MOBILE_GROUPS = [
  {
    title: "Gündem & Raporlar",
    items: [
      { href: "/", label: "Ana Sayfa", icon: Home, exact: true },
      { href: "/duyurular", label: "Duyuru & Haberler", icon: Megaphone, exact: false },
      { href: "/faaliyetler", label: "Faaliyet Raporları", icon: FileCheck2, exact: false },
      { href: "/taziye", label: "Taziye İlanları", icon: HeartHandshake, exact: false },
    ],
  },
  {
    title: "Köyümüz & Kurumsal",
    items: [
      { href: "/koyumuz", label: "Köyümüz & Tarihçe", icon: MapPin, exact: false },
      { href: "/dernek", label: "Derneğimiz & Yönetim", icon: Building2, exact: false },
      { href: "/galeri", label: "Fotoğraf Galerisi", icon: Images, exact: false },
      { href: "/iletisim", label: "İletişim & Muhtarlık", icon: Phone, exact: false },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e5e0] bg-white/95 backdrop-blur-md">
      {/* Kırmızı Üst Kuşak */}
      <div className="border-b border-[#9a0715] bg-gradient-to-r from-[#b5091a] via-[#e30a17] to-[#b5091a] px-3 py-1 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center sm:gap-3">
          <TurkishFlagSvg className="h-3 w-[18px] ring-white/30 sm:h-3.5 sm:w-[21px]" />
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase sm:gap-x-2 sm:text-[11px]">
            <span>Gazi Mustafa Kemal Atatürk</span>
            <span className="text-white/75" aria-hidden="true">
              ★
            </span>
            <span className="font-bold tracking-[0.14em] text-white">
              Sonsuza Dek
            </span>
          </p>
          <TurkishFlagSvg className="h-3 w-[18px] ring-white/30 sm:h-3.5 sm:w-[21px]" />
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? "bg-[#f4f3ef] text-[#191919]"
                    : "text-[#666560] hover:bg-[#fbfbfa] hover:text-[#191919]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/bagis"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] lg:hidden"
          >
            <Landmark className="h-3.5 w-3.5 text-[#666560]" />
            <span>Bağış</span>
          </Link>

          <Link
            href="/admin"
            className="hidden items-center gap-1.5 rounded-md border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] sm:inline-flex"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#666560]" />
            Yönetici
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] transition-colors hover:bg-[#f4f3ef] lg:hidden"
            aria-label="Menüyü Aç/Kapat"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-5.5rem)] overflow-y-auto border-t border-[#e6e5e0] bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="space-y-5">
            {MOBILE_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#666560]">
                  {group.title}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const active = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors ${
                          active
                            ? "border-[#191919] bg-[#191919] text-white"
                            : "border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] hover:bg-[#f4f3ef]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active ? "text-white" : "text-[#666560]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 border-t border-[#e6e5e0] pt-4">
              <Link
                href="/bagis"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#191919] px-3 py-2.5 text-xs font-medium text-white"
              >
                <Landmark className="h-4 w-4" />
                Bağış & IBAN
              </Link>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2.5 text-xs font-medium text-[#191919]"
              >
                <ShieldCheck className="h-4 w-4 text-[#666560]" />
                Yönetici Paneli
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
