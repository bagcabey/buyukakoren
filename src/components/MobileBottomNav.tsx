"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileCheck2,
  HeartHandshake,
  Home,
  Images,
  Megaphone,
} from "lucide-react";

const BOTTOM_ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: Home, exact: true },
  { href: "/duyurular", label: "Duyurular", icon: Megaphone, exact: false },
  { href: "/faaliyetler", label: "Faaliyetler", icon: FileCheck2, exact: false },
  { href: "/taziye", label: "Taziye", icon: HeartHandshake, exact: false },
  { href: "/galeri", label: "Galeri", icon: Images, exact: false },
];

export function MobileBottomNav() {
  const rawPathname = usePathname() || "/";
  const pathname =
    rawPathname === "/index" || rawPathname === "" ? "/" : rawPathname;

  return (
    <nav
      aria-label="Mobil Alt Navigasyon"
      className="no-print pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[#e6e5e0] bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-1">
        {BOTTOM_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] transition-colors active:scale-95 ${
                active
                  ? "font-semibold text-[#191919]"
                  : "font-medium text-[#666560] hover:text-[#191919]"
              }`}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[#191919]" />
              )}
              <span
                className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-[#f4f3ef] text-[#191919]" : "text-[#666560]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
