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
  title: "B.Akören | Büyük Akören Köyü Derneği — Sivas Yıldızeli",
  description:
    "Sivas Yıldızeli Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî duyuru, faaliyet raporu, taziye ve bilgi portalı.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getAllStoreData();

  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col bg-white text-[#191919] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer settings={data.site_settings} />
        <MobileBottomNav />
      </body>
    </html>
  );
}
