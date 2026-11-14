"use client";

import { Share2 } from "lucide-react";

export function ShareWhatsAppButton({ title }: { title: string }) {
  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(`${title} — Büyük Akören Köyü Derneği\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef]"
    >
      <Share2 className="h-3.5 w-3.5 text-[#666560]" />
      WhatsApp&apos;ta Paylaş
    </button>
  );
}
