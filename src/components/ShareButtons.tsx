"use client";

import { useState } from "react";
import { Check, Copy, Printer, Share2 } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

interface ShareButtonsProps {
  title: string;
  path?: string;
  showPrint?: boolean;
}

export function ShareButtons({ title, path, showPrint = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function getShareUrl(): string {
    if (typeof window !== "undefined") {
      if (path) {
        return new URL(path, window.location.origin).toString();
      }
      return window.location.href;
    }
    return path ? `${SITE_URL}${path}` : SITE_URL;
  }

  function openWindow(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function handleWhatsApp() {
    const url = getShareUrl();
    const text = encodeURIComponent(`${title} — Büyük Akören Köyü Derneği\n${url}`);
    openWindow(`https://wa.me/?text=${text}`);
  }

  function handleFacebook() {
    const url = encodeURIComponent(getShareUrl());
    openWindow(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  }

  function handleX() {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`${title} — Büyük Akören Köyü Derneği`);
    openWindow(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API engelli ortamda sessizce geç
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleWhatsApp}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-950 transition-colors hover:bg-emerald-100 sm:min-h-[36px]"
      >
        <Share2 className="h-3.5 w-3.5 text-emerald-700" />
        WhatsApp
      </button>
      <button
        type="button"
        onClick={handleFacebook}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] sm:min-h-[36px]"
      >
        Facebook
      </button>
      <button
        type="button"
        onClick={handleX}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] sm:min-h-[36px]"
      >
        X / Paylaş
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#fbfbfa] sm:min-h-[36px]"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-700" />
            Kopyalandı
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-[#666560]" />
            Bağlantıyı Kopyala
          </>
        )}
      </button>
      {showPrint && (
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#fbfbfa] sm:min-h-[36px]"
        >
          <Printer className="h-3.5 w-3.5 text-[#666560]" />
          Yazdır
        </button>
      )}
    </div>
  );
}
