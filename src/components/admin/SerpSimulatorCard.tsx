"use client";

import { useMemo } from "react";
import { Globe, MoreVertical, Sparkles } from "lucide-react";

interface SerpSimulatorCardProps {
  title: string;
  description: string;
  slug?: string;
  seoTitle: string;
  seoDesc: string;
  onSeoTitleChange: (val: string) => void;
  onSeoDescChange: (val: string) => void;
  baseUrl?: string;
}

export function SerpSimulatorCard({
  title,
  description,
  slug,
  seoTitle,
  seoDesc,
  onSeoTitleChange,
  onSeoDescChange,
  baseUrl = "buyukakoren.vercel.app",
}: SerpSimulatorCardProps) {
  // Displayed Title in SERP: explicit seoTitle or fallback to post title or placeholder
  const displayTitle = useMemo(() => {
    const raw = seoTitle.trim() || title.trim();
    if (!raw) return "Duyuru ve Haber Başlığı | Büyük Akören Köyü Derneği";
    if (raw.toLowerCase().includes("akören") || raw.toLowerCase().includes("büyükakören")) {
      return raw;
    }
    return `${raw} | Büyükakören`;
  }, [seoTitle, title]);

  // Displayed Description in SERP: explicit seoDesc or fallback to summary
  const displayDesc = useMemo(() => {
    const raw = seoDesc.trim() || description.trim();
    if (!raw) {
      return "Sivas Yıldızeli Büyükakören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî duyuru, haber ve faaliyet kaydı.";
    }
    return raw;
  }, [seoDesc, description]);

  const displaySlug = slug ? slug.replace(/^\//, "") : "duyuru-basligi";

  // Title character metrics (recommended 50-60 chars)
  const titleLen = (seoTitle || title).length;
  const titleStatus = useMemo(() => {
    if (titleLen === 0) return { label: "Boş", color: "text-stone-400", bar: "bg-stone-200", percent: 0 };
    if (titleLen < 30) return { label: "Kısa (Genişletilebilir)", color: "text-amber-600", bar: "bg-amber-400", percent: (titleLen / 60) * 100 };
    if (titleLen <= 60) return { label: "İdeal Uzunluk", color: "text-emerald-600", bar: "bg-emerald-500", percent: (titleLen / 60) * 100 };
    if (titleLen <= 70) return { label: "Sınırda (Kısaltılabilir)", color: "text-amber-600", bar: "bg-amber-500", percent: 100 };
    return { label: "Çok Uzun (Arama motoru kesebilir)", color: "text-red-600", bar: "bg-red-500", percent: 100 };
  }, [titleLen]);

  // Description character metrics (recommended 135-160 chars)
  const descLen = (seoDesc || description).length;
  const descStatus = useMemo(() => {
    if (descLen === 0) return { label: "Boş", color: "text-stone-400", bar: "bg-stone-200", percent: 0 };
    if (descLen < 100) return { label: "Kısa (Daha açıklayıcı olabilir)", color: "text-amber-600", bar: "bg-amber-400", percent: (descLen / 160) * 100 };
    if (descLen <= 160) return { label: "İdeal Uzunluk", color: "text-emerald-600", bar: "bg-emerald-500", percent: (descLen / 160) * 100 };
    if (descLen <= 175) return { label: "Sınırda (Son kelimeler kesilebilir)", color: "text-amber-600", bar: "bg-amber-500", percent: 100 };
    return { label: "Aşırı Uzun (Kesilecek)", color: "text-red-600", bar: "bg-red-500", percent: 100 };
  }, [descLen]);

  return (
    <div className="rounded-xl border border-[#e6e5e0] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-[#e6e5e0] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#191919]">
              Google Arama Snippet Simülatörü (SERP Preview)
            </h3>
            <p className="text-[11px] text-[#666560]">
              Yazınızın Google arama sonuçlarında nasıl görüneceğini canlı inceleyin
            </p>
          </div>
        </div>
        <span className="hidden items-center gap-1 rounded bg-[#f4f3ef] px-2 py-0.5 text-[10px] font-semibold text-[#191919] sm:inline-flex">
          <Sparkles className="h-3 w-3 text-amber-600" />
          SEO Önerileri Aktif
        </span>
      </div>

      {/* Realistic Google Search Card Box */}
      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 font-sans">
        {/* Google URL & Favicon Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-[#191919] text-xs font-bold border border-stone-300">
              BA
            </div>
            <div className="flex flex-col text-xs leading-none">
              <span className="text-[13px] font-medium text-[#202124]">
                Büyükakören Köyü Derneği
              </span>
              <span className="font-mono text-[11px] text-[#4d5156] mt-0.5 truncate max-w-xs sm:max-w-md">
                https://{baseUrl} › duyurular › {displaySlug}
              </span>
            </div>
          </div>
          <MoreVertical className="h-4 w-4 text-[#70757a]" />
        </div>

        {/* Google Result Title */}
        <div className="mt-2">
          <a
            href="#serp-preview"
            onClick={(e) => e.preventDefault()}
            className="text-lg sm:text-xl font-medium leading-snug text-[#1a0dab] hover:underline cursor-pointer block line-clamp-1"
          >
            {displayTitle}
          </a>
        </div>

        {/* Google Snippet Description */}
        <div className="mt-1 text-[13px] leading-relaxed text-[#4d5156] line-clamp-2">
          <span className="font-normal text-[#70757a]">Bugün — </span>
          {displayDesc}
        </div>
      </div>

      {/* Inputs & Character Meters */}
      <div className="mt-4 space-y-3.5 pt-2">
        {/* SEO Title Input */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-[#191919]">
              Özel SEO Başlığı (Meta Title)
            </label>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`font-semibold ${titleStatus.color}`}>
                {titleLen} / 60 karakter
              </span>
              <span className="text-[#888780]">({titleStatus.label})</span>
            </div>
          </div>
          <input
            type="text"
            placeholder="Boş bırakılırsa haber başlığı otomatik kullanılır..."
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs focus:border-[#191919] focus:outline-none"
          />
          {/* Progress Bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0eee9]">
            <div
              className={`h-full transition-all duration-300 ${titleStatus.bar}`}
              style={{ width: `${Math.min(100, titleStatus.percent)}%` }}
            />
          </div>
        </div>

        {/* SEO Description Input */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-[#191919]">
              Özel Meta Açıklaması (Meta Description)
            </label>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={`font-semibold ${descStatus.color}`}>
                {descLen} / 160 karakter
              </span>
              <span className="text-[#888780]">({descStatus.label})</span>
            </div>
          </div>
          <textarea
            rows={2}
            placeholder="Boş bırakılırsa kısa özet otomatik kullanılır (ideal aralık 135-160 karakter)..."
            value={seoDesc}
            onChange={(e) => onSeoDescChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs focus:border-[#191919] focus:outline-none"
          />
          {/* Progress Bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0eee9]">
            <div
              className={`h-full transition-all duration-300 ${descStatus.bar}`}
              style={{ width: `${Math.min(100, descStatus.percent)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
