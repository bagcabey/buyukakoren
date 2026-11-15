"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Eye,
  Heading2,
  Heading3,
  HelpCircle,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PenLine,
  Quote,
} from "lucide-react";
import { renderSafeRichText } from "@/lib/sanitize";

interface MarkdownPostEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}

export function MarkdownPostEditor({
  value,
  onChange,
  rows = 8,
  placeholder = "Haberin veya açıklamanın tam metnini giriniz...",
  required = false,
}: MarkdownPostEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Smart selection insertion helper
  function insertFormat(prefix: string, suffix = "", defaultPlaceholder = "") {
    const el = textareaRef.current;
    if (!el) {
      onChange(value ? `${value}\n\n${prefix}${defaultPlaceholder}${suffix}` : `${prefix}${defaultPlaceholder}${suffix}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.slice(start, end);
    const contentToWrap = selectedText || defaultPlaceholder;
    const replacement = `${prefix}${contentToWrap}${suffix}`;

    const nextValue = value.slice(0, start) + replacement + value.slice(end);
    onChange(nextValue);

    // Reposition cursor
    setTimeout(() => {
      el.focus();
      const newCursorPos = start + prefix.length + contentToWrap.length;
      el.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 0);
  }

  function insertBlock(prefix: string, defaultPlaceholder = "") {
    const el = textareaRef.current;
    if (!el) {
      onChange(value ? `${value.trimEnd()}\n\n${prefix}${defaultPlaceholder}` : `${prefix}${defaultPlaceholder}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = value.slice(start, end);

    let insertion = "";
    if (selectedText) {
      // Prefix each line if multiline
      insertion = selectedText
        .split("\n")
        .map((line) => `${prefix}${line}`)
        .join("\n");
    } else {
      insertion = `${prefix}${defaultPlaceholder}`;
    }

    // Ensure empty line before if needed
    const before = value.slice(0, start);
    const after = value.slice(end);
    const needsNewlineBefore = before.length > 0 && !before.endsWith("\n\n");
    const prefixNewline = needsNewlineBefore ? (before.endsWith("\n") ? "\n" : "\n\n") : "";

    const nextValue = before + prefixNewline + insertion + "\n\n" + after;
    onChange(nextValue);

    setTimeout(() => {
      el.focus();
      const newPos = start + prefixNewline.length + insertion.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  }

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="rounded-xl border border-[#e6e5e0] bg-white shadow-xs">
      {/* Top Header with Tabs & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-[#e6e5e0] bg-white p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTab === "edit"
                ? "bg-[#191919] text-white shadow-xs"
                : "text-[#666560] hover:text-[#191919]"
            }`}
          >
            <PenLine className="h-3.5 w-3.5" />
            Düzenle
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition ${
              activeTab === "preview"
                ? "bg-[#191919] text-white shadow-xs"
                : "text-[#666560] hover:text-[#191919]"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Canlı Önizleme
          </button>
        </div>

        {/* Toolbar (Visible in edit tab) */}
        {activeTab === "edit" && (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => insertBlock("## ", "Bölüm Başlığı")}
              className="inline-flex h-7 items-center justify-center rounded border border-[#e6e5e0] bg-white px-2 text-xs font-semibold text-[#191919] hover:bg-[#f4f3ef]"
              title="Başlık 2 (H2)"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock("### ", "Alt Başlık")}
              className="inline-flex h-7 items-center justify-center rounded border border-[#e6e5e0] bg-white px-2 text-xs font-semibold text-[#191919] hover:bg-[#f4f3ef]"
              title="Başlık 3 (H3)"
            >
              <Heading3 className="h-3.5 w-3.5" />
            </button>

            <span className="mx-0.5 h-4 w-px bg-[#e6e5e0]" />

            <button
              type="button"
              onClick={() => insertFormat("**", "**", "kalın metin")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="Kalın (Bold)"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("*", "*", "italik metin")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="İtalik"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>

            <span className="mx-0.5 h-4 w-px bg-[#e6e5e0]" />

            <button
              type="button"
              onClick={() => insertBlock("- ", "Madde")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="Madde İşaretli Liste"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock("1. ", "Sıralı Madde")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="Numaralı Liste"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock("> ", "Önemli alıntı veya duyuru notu")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="Alıntı (Blockquote)"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>

            <span className="mx-0.5 h-4 w-px bg-[#e6e5e0]" />

            <button
              type="button"
              onClick={() => insertFormat("[", "](https://...)", "Bağlantı Başlığı")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="Köprü / Link"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("![", "](https://.../gorsel.webp)", "Görsel Açıklaması")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="Görsel Ekle"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertBlock("---\n", "")}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
              title="Yatay Çizgi (Ayrıcı)"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowCheatsheet((p) => !p)}
              className={`inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] font-medium transition ${
                showCheatsheet
                  ? "border-[#191919] bg-[#191919] text-white"
                  : "border-[#e6e5e0] bg-white text-[#666560] hover:text-[#191919]"
              }`}
              title="Biçimlendirme Kılavuzu"
            >
              <HelpCircle className="h-3 w-3" />
              Kılavuz
            </button>
          </div>
        )}
      </div>

      {/* Cheatsheet Accordion */}
      {showCheatsheet && activeTab === "edit" && (
        <div className="border-b border-[#e6e5e0] bg-[#f4f3ef] px-4 py-3 text-xs text-[#4a4945]">
          <p className="font-semibold text-[#191919]">Hızlı Markdown Kılavuzu:</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">## Başlık</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">Ana başlık (H2)</p>
            </div>
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">**kalın**</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">Kalın vurgulu metin</p>
            </div>
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">*italik*</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">İtalik metin</p>
            </div>
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">- Madde</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">Madde listesi</p>
            </div>
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">[Başlık](URL)</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">Tıklanabilir link</p>
            </div>
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">&gt; Alıntı</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">Vurgulu kutu alıntısı</p>
            </div>
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">![Metin](URL)</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">Görsel yerleştirme</p>
            </div>
            <div>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono">---</code>
              <p className="mt-0.5 text-[10px] text-[#666560]">Yatay bölücü çizgi</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Body */}
      {activeTab === "edit" ? (
        <textarea
          ref={textareaRef}
          rows={rows}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-y rounded-b-none border-0 p-3.5 font-mono text-xs leading-relaxed text-[#191919] focus:outline-none focus:ring-0 sm:text-sm"
        />
      ) : (
        <div className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 sm:p-6">
          {value.trim() ? (
            <div
              className="prose-akoren space-y-3 text-sm leading-relaxed text-[#191919] [&_a]:font-medium [&_a]:text-red-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-stone-400 [&_blockquote]:bg-stone-50 [&_blockquote]:py-1.5 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#191919] [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-5 [&_ul]:list-disc [&_ol]:list-decimal [&_p]:mb-2"
              dangerouslySetInnerHTML={{ __html: renderSafeRichText(value) }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#666560]">
              <PenLine className="h-8 w-8 text-[#e6e5e0]" />
              <p className="mt-2 text-xs font-medium">Henüz içerik girilmedi.</p>
              <p className="text-[11px] text-[#666560]">
                Canlı önizlemeyi görmek için &quot;Düzenle&quot; sekmesine geçip yazmaya başlayın.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Counter Bar */}
      <div className="flex items-center justify-between border-t border-[#e6e5e0] bg-[#fbfbfa] px-3.5 py-2 text-[11px] text-[#666560]">
        <div className="flex items-center gap-2">
          <span>
            {wordCount} <strong className="font-medium text-[#191919]">kelime</strong>
          </span>
          <span>•</span>
          <span>
            {charCount} <strong className="font-medium text-[#191919]">karakter</strong>
          </span>
        </div>
        <span className="hidden font-mono text-[10px] text-[#888780] sm:inline">
          Markdown &amp; HTML Destekli Zengin Editör
        </span>
      </div>
    </div>
  );
}
