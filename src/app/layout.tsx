import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DEFAULT_SEO_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";
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
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: `${SITE_NAME} | Yıldızeli, Sivas`,
  description:
    "Sivas Yıldızeli Büyükakören (Büyük Akören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî duyuru, faaliyet ve taziye portalı.",
  keywords: DEFAULT_SEO_KEYWORDS,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "tr_TR",
    type: "website",
  },
  verification: {
    google: "5cdf4f27709d4a0f",
  },
};

export const revalidate = 60;

const BUILTIN_EDITABLE_SLUGS = new Set([
  "/",
  "/koyumuz",
  "/dernek",
  "/bagis",
  "/iletisim",
  "/kvkk",
  "/gizlilik",
  "/kullanim-kosullari",
  "/kunye",
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
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
        <Footer settings={data.site_settings} extraPages={extraMenuPages} />
        <MobileBottomNav />
      </body>
    </html>
  );
}
