"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyIbanButton({ iban }: { iban: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(iban.replace(/\s+/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef]"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-700" />
          Kopyalandı
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 text-[#666560]" />
          IBAN Kopyala
        </>
      )}
    </button>
  );
}
