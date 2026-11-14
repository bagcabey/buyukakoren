import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { getAllStoreData } from "@/lib/store";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-brand",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://buyukakoren.vercel.app"),
  title: "B.Akören | Büyük Akören Köyü Derneği — Sivas Yıldızeli",
  description:
    "Sivas Yıldızeli Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî duyuru, faaliyet raporu, taziye ve bilgi portalı.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    google: "5cdf4f27709d4a0f",
  },
};

export const dynamic = "force-dynamic";

const BUILTIN_EDITABLE_SLUGS = new Set([
  "/",
  "/koyumuz",
  "/dernek",
  "/bagis",
  "/iletisim",
]);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getAllStoreData(false);
  const extraMenuPages = (data.pages || [])
    .filter(
      (p) =>
        p.status === "published" &&
        p.show_in_menu &&
        !BUILTIN_EDITABLE_SLUGS.has(p.slug)
    )
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      menu_label: p.menu_label,
      menu_order: p.menu_order,
    }));

  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col bg-white text-[#191919] antialiased">
        <Navbar settings={data.site_settings} extraPages={extraMenuPages} />
        <main className="flex-1">{children}</main>
        <Footer settings={data.site_settings} extraPages={extraMenuPages} />
        <MobileBottomNav />
      </body>
    </html>
  );
}
