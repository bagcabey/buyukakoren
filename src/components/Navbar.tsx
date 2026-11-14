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
import { NavItem, SiteSettings } from "@/lib/types";

export interface NavbarExtraPage {
  slug: string;
  title: string;
  menu_label?: string;
  menu_order?: number;
}

const FALLBACK_NAV_LINKS: NavItem[] = [
  { id: "nav-home", href: "/", label: "Ana Sayfa", visible: true, order: 1 },
  { id: "nav-posts", href: "/duyurular", label: "Duyuru & Haberler", visible: true, order: 2 },
  { id: "nav-activities", href: "/faaliyetler", label: "Faaliyetler", visible: true, order: 3 },
  { id: "nav-condolences", href: "/taziye", label: "Taziye", visible: true, order: 4 },
  { id: "nav-village", href: "/koyumuz", label: "Köyümüz", visible: true, order: 5 },
  { id: "nav-association", href: "/dernek", label: "Derneğimiz", visible: true, order: 6 },
  { id: "nav-gallery", href: "/galeri", label: "Galeri", visible: true, order: 7 },
  { id: "nav-donate", href: "/bagis", label: "Bağış", visible: true, order: 8 },
  { id: "nav-contact", href: "/iletisim", label: "İletişim", visible: true, order: 9 },
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

function normalizeHref(slug: string): string {
  const s = (slug || "/").trim();
  if (s === "/" || s === "") return "/";
  return s.startsWith("/") ? s : `/${s}`;
}

export function Navbar({
  settings,
  extraPages = [],
}: {
  settings?: SiteSettings;
  extraPages?: NavbarExtraPage[];
}) {
  const rawPathname = usePathname() || "/";
  const pathname =
    rawPathname === "/index" || rawPathname === "" ? "/" : rawPathname;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const baseNav =
    settings?.nav_items && settings.nav_items.length > 0
      ? settings.nav_items
      : FALLBACK_NAV_LINKS;

  const hiddenHrefs = new Set(
    baseNav.filter((i) => i.visible === false).map((i) => normalizeHref(i.href))
  );
  const existingHrefs = new Set(baseNav.map((i) => normalizeHref(i.href)));

  const visibleNavItems: NavItem[] = [
    ...baseNav.filter((i) => i.visible !== false),
    ...extraPages
      .map((p, idx) => ({
        id: `page-${p.slug}`,
        href: normalizeHref(p.slug),
        label: p.menu_label?.trim() || p.title,
        visible: true,
        order: typeof p.menu_order === "number" ? p.menu_order : 50 + idx,
      }))
      .filter((p) => !existingHrefs.has(p.href)),
  ].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const ribbonText = settings?.ataturk_ribbon_text?.trim() || "Sonsuza Dek";

  return (
    <header className="no-print sticky top-0 z-40 border-b border-[#e6e5e0] bg-white/95 backdrop-blur-md">
      {/* Kırmızı Üst Kuşak (Zorunlu) */}
      <div className="border-b border-[#9a0715] bg-gradient-to-r from-[#b5091a] via-[#e30a17] to-[#b5091a] px-3 py-1 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center sm:gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ataturk.jpg"
            alt="Gazi Mustafa Kemal Atatürk"
            className="h-5 w-5 shrink-0 rounded-full object-cover object-top shadow-xs ring-1 ring-white/90 sm:h-6 sm:w-6"
          />
          <TurkishFlagSvg className="h-3 w-[18px] ring-white/30 sm:h-3.5 sm:w-[21px]" />
          <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase sm:gap-x-2 sm:text-[11px]">
            <span>Gazi Mustafa Kemal Atatürk</span>
            <span className="text-white/75" aria-hidden="true">
              ★
            </span>
            <span className="font-bold tracking-[0.14em] text-white">
              {ribbonText}
            </span>
          </p>
          <TurkishFlagSvg className="h-3 w-[18px] ring-white/30 sm:h-3.5 sm:w-[21px]" />
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Ana menü">
          {visibleNavItems.map((item) => {
            const href = normalizeHref(item.href);
            const isExternal = item.is_external || href.startsWith("http");
            const active =
              !isExternal &&
              (href === "/" ? pathname === "/" : pathname.startsWith(href));
            if (isExternal) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-[#666560] transition-colors hover:bg-[#fbfbfa] hover:text-[#191919]"
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.id}
                href={href}
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
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] lg:hidden"
          >
            <Landmark className="h-3.5 w-3.5 text-[#666560]" />
            <span>Bağış</span>
          </Link>

          <Link
            href="/admin"
            className="hidden min-h-[40px] items-center gap-1.5 rounded-md border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] sm:inline-flex"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#666560]" />
            Yönetici
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] transition-colors hover:bg-[#f4f3ef] lg:hidden"
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
            {MOBILE_GROUPS.map((group) => {
              const filteredItems = group.items.filter(
                (item) => !hiddenHrefs.has(normalizeHref(item.href))
              );
              if (filteredItems.length === 0) return null;
              return (
                <div key={group.title}>
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#666560]">
                    {group.title}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredItems.map((item) => {
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
              );
            })}

            {extraPages.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#666560]">
                  Diğer Sayfalar
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {extraPages.map((p) => {
                    const href = normalizeHref(p.slug);
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors ${
                          active
                            ? "border-[#191919] bg-[#191919] text-white"
                            : "border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] hover:bg-[#f4f3ef]"
                        }`}
                      >
                        <span className="truncate">{p.menu_label?.trim() || p.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

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
