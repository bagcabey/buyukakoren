"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  LayoutTemplate,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import {
  GalleryPhoto,
  PageBlock,
  PageBlockType,
  PageConfig,
  PublishStatus,
} from "@/lib/types";

const BLOCK_TEMPLATES: {
  type: PageBlockType;
  label: string;
  defaultData: Record<string, unknown>;
}[] = [
  {
    type: "hero",
    label: "Hero / Üst Manşet",
    defaultData: {
      badge: "Sivas • Yıldızeli • Büyükakören",
      title: "Sayfa Başlığı",
      subtitle: "Kısa tanıtım ve açıklama metni.",
      image_url: "",
      image_alt: "",
      primary_label: "",
      primary_href: "",
      secondary_label: "",
      secondary_href: "",
    },
  },
  {
    type: "rich_text",
    label: "Zengin Metin / Yazı",
    defaultData: {
      eyebrow: "",
      title: "Bölüm Başlığı",
      content: "## Alt Başlık\n\nMetninizi buraya yazın.",
      source_note: "",
    },
  },
  {
    type: "image",
    label: "Tekil Büyük Görsel",
    defaultData: {
      image_url: "",
      alt: "",
      caption: "",
      attribution: "",
    },
  },
  {
    type: "image_text",
    label: "Görsel + Metin Yan Yana",
    defaultData: {
      eyebrow: "",
      title: "Başlık",
      text: "Açıklama metni.",
      image_url: "",
      image_alt: "",
      image_position: "left",
      bullets: [],
      cta_label: "",
      cta_href: "",
    },
  },
  {
    type: "card_grid",
    label: "Kart Izgarası",
    defaultData: {
      eyebrow: "",
      title: "Kart Bölümü",
      subtitle: "",
      columns: 3,
      cards: [
        {
          id: `c-${Date.now()}`,
          badge: "01",
          title: "Kart Başlığı",
          description: "Kart açıklaması.",
          link_label: "",
          link_href: "",
        },
      ],
    },
  },
  {
    type: "stats",
    label: "Rakamlar / İstatistik Şeridi",
    defaultData: {
      eyebrow: "Veriler",
      title: "Temel Göstergeler",
      subtitle: "",
      items: [
        { id: `st-${Date.now()}`, label: "Başlık", value: "Değer", subtext: "" },
      ],
    },
  },
  {
    type: "timeline",
    label: "Zaman Çizelgesi",
    defaultData: {
      eyebrow: "Tarihçe",
      title: "Dönemler / Nüfus Seyri",
      description: "",
      items: [
        { id: `tl-${Date.now()}`, year: "2025", value: "449 Kişi", note: "", highlight: false },
      ],
    },
  },
  {
    type: "gallery_preview",
    label: "Galeri Önizlemesi",
    defaultData: {
      eyebrow: "Görsel Arşiv",
      title: "Fotoğraf Galerisi",
      limit: 6,
      album: "Tümü",
      more_label: "Tüm Galeriyi Gör",
      more_href: "/galeri",
    },
  },
  {
    type: "latest_posts",
    label: "Son Duyuru / Faaliyet Listesi",
    defaultData: {
      eyebrow: "Güncel Yayınlar",
      title: "Son Duyuru ve Haberler",
      limit: 6,
      category: "all",
      more_label: "Tümünü Gör",
      more_href: "/duyurular",
    },
  },
  {
    type: "cta",
    label: "Çağrı Kutusu (CTA)",
    defaultData: {
      theme: "dark",
      eyebrow: "Katılım",
      title: "Dernek ile İletişime Geçin",
      description: "Öneri, görüş ve destek talepleriniz için mesaj gönderebilirsiniz.",
      primary_label: "İletişim",
      primary_href: "/iletisim",
      secondary_label: "",
      secondary_href: "",
    },
  },
  {
    type: "faq",
    label: "Sıkça Sorulan Sorular",
    defaultData: {
      eyebrow: "Bilgilendirme",
      title: "Sıkça Sorulan Sorular",
      items: [
        { id: `fq-${Date.now()}`, question: "Soru?", answer: "Cevap." },
      ],
    },
  },
  {
    type: "iban_card",
    label: "Dernek IBAN & Bağış Kartı",
    defaultData: {
      eyebrow: "Bağış ve Aidat",
      title: "Resmî Dernek Banka Hesabı",
      description: "",
    },
  },
  {
    type: "board_members",
    label: "Yönetim Kurulu Listesi",
    defaultData: {
      eyebrow: "Yönetim",
      title: "Yönetim Kurulu",
      description: "",
    },
  },
  {
    type: "contact_card",
    label: "İletişim Bilgileri & Form",
    defaultData: {
      title: "İletişim Bilgileri & Mesaj Formu",
      description: "",
      show_form: true,
    },
  },
  {
    type: "map",
    label: "Konum Haritası",
    defaultData: {
      title: "Büyükakören Köyü Haritası",
      description: "Büyükakören Köyü, Yıldızeli / Sivas",
      lat: 39.603056,
      lng: 36.438056,
      zoom: 13,
    },
  },
];

function cloneTemplate(type: PageBlockType, order: number): PageBlock {
  const tpl = BLOCK_TEMPLATES.find((t) => t.type === type) || BLOCK_TEMPLATES[1];
  return {
    id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: tpl.type,
    visible: true,
    order,
    data: JSON.parse(JSON.stringify(tpl.defaultData)) as Record<string, unknown>,
  };
}

function getBlockLabel(type: PageBlockType): string {
  return BLOCK_TEMPLATES.find((t) => t.type === type)?.label || type;
}

export function PageDesignerTab({
  pages,
  galleryPhotos,
  storeVersion,
  onPagesUpdated,
  notify,
  uploadFile,
}: {
  pages: PageConfig[];
  galleryPhotos: GalleryPhoto[];
  storeVersion: number;
  onPagesUpdated: (nextPages: PageConfig[], nextVersion?: number) => void;
  notify: (msg: string, err?: boolean) => void;
  uploadFile: (file: File) => Promise<string | null>;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string>(pages[0]?.slug || "/");
  const [draftPage, setDraftPage] = useState<PageConfig | null>(
    pages[0] ? (JSON.parse(JSON.stringify(pages[0])) as PageConfig) : null
  );
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(
    pages[0]?.blocks?.[0]?.id || null
  );
  const [saving, setSaving] = useState(false);
  const [newBlockType, setNewBlockType] = useState<PageBlockType>("rich_text");
  const [creatingNewPage, setCreatingNewPage] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");

  useEffect(() => {
    const found = pages.find((p) => p.slug === selectedSlug) || pages[0];
    if (found) {
      setDraftPage(JSON.parse(JSON.stringify(found)) as PageConfig);
    }
  }, [pages, selectedSlug]);

  function selectPage(slug: string) {
    setSelectedSlug(slug);
    const found = pages.find((p) => p.slug === slug);
    if (found) {
      setDraftPage(JSON.parse(JSON.stringify(found)) as PageConfig);
      setExpandedBlockId(found.blocks?.[0]?.id || null);
    }
  }

  function updateBlockData(blockId: string, key: string, value: unknown) {
    if (!draftPage) return;
    setDraftPage({
      ...draftPage,
      blocks: draftPage.blocks.map((b) =>
        b.id === blockId ? { ...b, data: { ...b.data, [key]: value } } : b
      ),
    });
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    if (!draftPage) return;
    const sorted = [...draftPage.blocks].sort((a, b) => a.order - b.order);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const tmp = sorted[idx];
    sorted[idx] = sorted[target];
    sorted[target] = tmp;
    const reordered = sorted.map((b, i) => ({ ...b, order: i + 1 }));
    setDraftPage({ ...draftPage, blocks: reordered });
  }

  function addBlock() {
    if (!draftPage) return;
    const nextOrder = draftPage.blocks.length + 1;
    const nb = cloneTemplate(newBlockType, nextOrder);
    setDraftPage({ ...draftPage, blocks: [...draftPage.blocks, nb] });
    setExpandedBlockId(nb.id);
  }

  function duplicateBlock(b: PageBlock) {
    if (!draftPage) return;
    const copy: PageBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: b.type,
      visible: b.visible,
      order: draftPage.blocks.length + 1,
      data: JSON.parse(JSON.stringify(b.data)) as Record<string, unknown>,
    };
    setDraftPage({ ...draftPage, blocks: [...draftPage.blocks, copy] });
    setExpandedBlockId(copy.id);
  }

  function deleteBlock(id: string) {
    if (!draftPage) return;
    const remaining = draftPage.blocks
      .filter((b) => b.id !== id)
      .sort((a, b) => a.order - b.order)
      .map((b, i) => ({ ...b, order: i + 1 }));
    setDraftPage({ ...draftPage, blocks: remaining });
  }

  function toggleBlockVisible(id: string) {
    if (!draftPage) return;
    setDraftPage({
      ...draftPage,
      blocks: draftPage.blocks.map((b) =>
        b.id === id ? { ...b, visible: !b.visible } : b
      ),
    });
  }

  async function handleSavePage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!draftPage) return;
    setSaving(true);
    try {
      const sortedBlocks = [...draftPage.blocks]
        .sort((a, b) => a.order - b.order)
        .map((b, idx) => ({ ...b, order: idx + 1 }));

      const res = await fetch("/api/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: draftPage.slug,
          title: draftPage.title,
          seo_title: draftPage.seo_title || "",
          seo_description: draftPage.seo_description || "",
          og_image: draftPage.og_image || "",
          status: draftPage.status,
          show_in_menu: draftPage.show_in_menu,
          menu_order: draftPage.menu_order,
          menu_label: draftPage.menu_label || draftPage.title,
          blocks: sortedBlocks,
          expected_version: storeVersion,
        }),
      });
      const j = (await res.json()) as {
        page?: PageConfig;
        version?: number;
        error?: string;
      };
      if (!res.ok) {
        notify(
          res.status === 409
            ? j.error || "Başka bir yönetici az önce değişiklik yaptı. Sayfayı yenileyin."
            : j.error || "Sayfa kaydedilemedi.",
          true
        );
        return;
      }
      if (j.page) {
        const exists = pages.some((p) => p.slug === j.page!.slug);
        const nextPages = exists
          ? pages.map((p) => (p.slug === j.page!.slug ? j.page! : p))
          : [...pages, j.page!];
        onPagesUpdated(nextPages, j.version);
        setDraftPage(j.page);
      }
      notify(`"${draftPage.title}" sayfası kaydedildi.`);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateNewPage(e: React.FormEvent) {
    e.preventDefault();
    const cleanedSlug =
      "/" +
      newPageSlug
        .trim()
        .toLowerCase()
        .replace(/^\/+/, "")
        .replace(/[^a-z0-9-\/]/g, "-");
    if (cleanedSlug === "/" || cleanedSlug.length < 2 || !newPageTitle.trim()) {
      notify("Geçerli bir URL yolu (/tuzuk gibi) ve sayfa başlığı girin.", true);
      return;
    }
    const created: PageConfig = {
      slug: cleanedSlug,
      title: newPageTitle.trim(),
      seo_title: `${newPageTitle.trim()} | Büyük Akören Köyü Derneği`,
      seo_description: "",
      status: "draft",
      show_in_menu: true,
      menu_order: pages.length + 10,
      menu_label: newPageTitle.trim(),
      updated_at: new Date().toISOString(),
      revisions: [],
      blocks: [cloneTemplate("hero", 1), cloneTemplate("rich_text", 2)],
    };
    setCreatingNewPage(false);
    setNewPageSlug("");
    setNewPageTitle("");
    setSelectedSlug(created.slug);
    setDraftPage(created);
    setExpandedBlockId(created.blocks[0].id);
    notify("Yeni taslak sayfa oluşturuldu. Kaydetmek için 'Sayfayı Kaydet' butonuna basın.");
  }

  async function handleRollback(revisionId: string) {
    if (!draftPage) return;
    if (!confirm("Bu revizyona geri dönmek istediğinize emin misiniz?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rollback",
          slug: draftPage.slug,
          revision_id: revisionId,
          expected_version: storeVersion,
        }),
      });
      const j = (await res.json()) as {
        page?: PageConfig;
        version?: number;
        error?: string;
      };
      if (!res.ok) {
        notify(j.error || "Revizyona dönülemedi.", true);
        return;
      }
      if (j.page) {
        const nextPages = pages.map((p) =>
          p.slug === j.page!.slug ? j.page! : p
        );
        onPagesUpdated(nextPages, j.version);
        setDraftPage(j.page);
      }
      notify("Seçilen revizyon başarıyla geri yüklendi.");
    } finally {
      setSaving(false);
    }
  }

  const orderedBlocks = draftPage
    ? [...draftPage.blocks].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-12">
      {/* Left Sidebar: Pages Selector */}
      <div className="space-y-4 lg:col-span-4">
        <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#191919]">
              <LayoutTemplate className="h-4 w-4" />
              Sayfalar ({pages.length})
            </h2>
            <button
              type="button"
              onClick={() => setCreatingNewPage((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-[#e6e5e0] bg-white px-2.5 py-1 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
            >
              <Plus className="h-3.5 w-3.5" />
              Yeni Sayfa
            </button>
          </div>

          {creatingNewPage && (
            <form
              onSubmit={handleCreateNewPage}
              className="mt-3 space-y-2 rounded-lg border border-[#e6e5e0] bg-white p-3"
            >
              <input
                type="text"
                required
                placeholder="Sayfa Başlığı (Örn. Dernek Tüzüğü)"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="w-full rounded border border-[#e6e5e0] px-2.5 py-1.5 text-xs"
              />
              <input
                type="text"
                required
                placeholder="URL Yolu (Örn. /tuzuk)"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                className="w-full rounded border border-[#e6e5e0] px-2.5 py-1.5 font-mono text-xs"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded bg-[#191919] py-1.5 text-xs font-medium text-white"
                >
                  Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setCreatingNewPage(false)}
                  className="rounded border border-[#e6e5e0] px-3 py-1.5 text-xs"
                >
                  İptal
                </button>
              </div>
            </form>
          )}

          <div className="mt-3 space-y-1.5">
            {pages.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => selectPage(p.slug)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs transition-colors ${
                  selectedSlug === p.slug
                    ? "border-[#191919] bg-[#191919] text-white"
                    : "border-[#e6e5e0] bg-white text-[#191919] hover:bg-[#f4f3ef]"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p
                    className={`truncate font-mono text-[11px] ${
                      selectedSlug === p.slug ? "text-stone-300" : "text-[#666560]"
                    }`}
                  >
                    {p.slug}
                  </p>
                </div>
                <span
                  className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    p.status === "published"
                      ? "bg-emerald-600/20 text-emerald-700"
                      : "bg-amber-500/20 text-amber-700"
                  }`}
                >
                  {p.status === "published"
                    ? "Yayında"
                    : p.status === "draft"
                    ? "Taslak"
                    : "Arşiv"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Revisions */}
        {draftPage && draftPage.revisions && draftPage.revisions.length > 0 && (
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#666560]">
              <History className="h-3.5 w-3.5" />
              Sürüm Geçmişi (Son {draftPage.revisions.length})
            </h3>
            <div className="mt-3 space-y-2">
              {draftPage.revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#191919]">
                      {new Date(rev.saved_at).toLocaleString("tr-TR")}
                    </p>
                    <p className="truncate text-[11px] text-[#666560]">
                      {rev.saved_by} • {rev.blocks.length} blok
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleRollback(rev.id)}
                    className="inline-flex shrink-0 items-center gap-1 rounded border border-[#e6e5e0] bg-white px-2 py-1 text-[11px] font-medium text-[#191919] hover:bg-[#f4f3ef]"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Geri Yükle
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Column: Page Metadata & Blocks */}
      {draftPage && (
        <div className="space-y-6 lg:col-span-8">
          <form
            onSubmit={handleSavePage}
            className="space-y-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e5e0] pb-4">
              <div>
                <p className="font-mono text-xs text-[#666560]">
                  Sayfa Yolu: {draftPage.slug}
                </p>
                <h2 className="text-base font-semibold text-[#191919]">
                  Sayfa Ayarları & SEO
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={draftPage.slug}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Önizle
                </a>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#191919] px-4 py-2 text-xs font-semibold text-white hover:bg-[#333333] disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Kaydediliyor..." : "Sayfayı Kaydet"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Sayfa Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={draftPage.title}
                  onChange={(e) =>
                    setDraftPage({ ...draftPage, title: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Yayın Durumu
                </label>
                <select
                  value={draftPage.status}
                  onChange={(e) =>
                    setDraftPage({
                      ...draftPage,
                      status: e.target.value as PublishStatus,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                >
                  <option value="published">Yayında</option>
                  <option value="draft">Taslak</option>
                  <option value="archived">Arşiv</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Menü Sıra / Etiket
              </label>
              <div className="mt-1 flex items-center gap-2">
                <label className="inline-flex shrink-0 items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={draftPage.show_in_menu}
                    onChange={(e) =>
                      setDraftPage({
                        ...draftPage,
                        show_in_menu: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#e6e5e0]"
                  />
                  Menüde
                </label>
                <input
                  type="text"
                  placeholder="Menü Adı"
                  value={draftPage.menu_label || ""}
                  onChange={(e) =>
                    setDraftPage({ ...draftPage, menu_label: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs"
                />
                <input
                  type="number"
                  value={draftPage.menu_order}
                  onChange={(e) =>
                    setDraftPage({
                      ...draftPage,
                      menu_order: Number(e.target.value) || 1,
                    })
                  }
                  className="w-16 rounded-lg border border-[#e6e5e0] bg-white px-2 py-1.5 text-xs"
                />
              </div>
            </div>
          </form>

          {/* Add Block Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e6e5e0] bg-white p-4">
            <div>
              <h3 className="text-sm font-semibold text-[#191919]">
                Sayfa Blokları ({orderedBlocks.length})
              </h3>
              <p className="text-xs text-[#666560]">
                Blokları yukarı/aşağı taşıyabilir, düzenleyebilir, gizleyebilir veya çoğaltabilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={newBlockType}
                onChange={(e) =>
                  setNewBlockType(e.target.value as PageBlockType)
                }
                className="rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2 text-xs"
              >
                {BLOCK_TEMPLATES.map((tpl) => (
                  <option key={tpl.type} value={tpl.type}>
                    {tpl.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addBlock}
                className="inline-flex items-center gap-1 rounded-lg bg-[#191919] px-3 py-2 text-xs font-medium text-white hover:bg-[#333333]"
              >
                <Plus className="h-3.5 w-3.5" />
                Blok Ekle
              </button>
            </div>
          </div>

          {/* Blocks Accordion */}
          <div className="space-y-3">
            {orderedBlocks.map((block, idx) => {
              const isExpanded = expandedBlockId === block.id;
              const d = block.data || {};
              return (
                <div
                  key={block.id}
                  className={`rounded-xl border transition-colors ${
                    block.visible
                      ? "border-[#e6e5e0] bg-white"
                      : "border-dashed border-[#cfcec8] bg-[#fbfbfa] opacity-75"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBlockId(isExpanded ? null : block.id)
                      }
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="rounded bg-[#f4f3ef] px-2 py-0.5 text-[11px] font-semibold text-[#191919]">
                        #{idx + 1} {getBlockLabel(block.type)}
                      </span>
                      <span className="truncate text-sm font-semibold text-[#191919]">
                        {(d.title as string) ||
                          (d.eyebrow as string) ||
                          getBlockLabel(block.type)}
                      </span>
                    </button>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, -1)}
                        className="rounded border border-[#e6e5e0] p-1.5 text-[#666560] hover:text-[#191919]"
                        title="Yukarı Taşı"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(idx, 1)}
                        className="rounded border border-[#e6e5e0] p-1.5 text-[#666560] hover:text-[#191919]"
                        title="Aşağı Taşı"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBlockVisible(block.id)}
                        className="rounded border border-[#e6e5e0] p-1.5 text-[#666560] hover:text-[#191919]"
                        title={block.visible ? "Gizle" : "Göster"}
                      >
                        {block.visible ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateBlock(block)}
                        className="rounded border border-[#e6e5e0] p-1.5 text-[#666560] hover:text-[#191919]"
                        title="Bloğu Çoğalt"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="rounded border border-[#e6e5e0] p-1.5 text-red-600 hover:bg-red-50"
                        title="Bloğu Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-[#e6e5e0] bg-[#fbfbfa] p-4">
                      <BlockFieldsEditor
                        block={block}
                        galleryPhotos={galleryPhotos}
                        onUpdate={(key, val) => updateBlockData(block.id, key, val)}
                        uploadFile={uploadFile}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockFieldsEditor({
  block,
  galleryPhotos,
  onUpdate,
  uploadFile,
}: {
  block: PageBlock;
  galleryPhotos: GalleryPhoto[];
  onUpdate: (key: string, val: unknown) => void;
  uploadFile: (file: File) => Promise<string | null>;
}) {
  const d = block.data || {};
  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");

  return (
    <div className="space-y-3 text-xs">
      {"eyebrow" in d || block.type !== "map" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block font-medium text-[#191919]">Üst Etiket</label>
            <input
              type="text"
              value={str("eyebrow") || str("badge")}
              onChange={(e) =>
                onUpdate(block.type === "hero" ? "badge" : "eyebrow", e.target.value)
              }
              className="mt-1 w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-[#191919]">Blok Başlığı</label>
            <input
              type="text"
              value={str("title")}
              onChange={(e) => onUpdate("title", e.target.value)}
              className="mt-1 w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
            />
          </div>
        </div>
      ) : null}

      {(block.type === "hero" ||
        block.type === "cta" ||
        block.type === "stats" ||
        block.type === "timeline" ||
        block.type === "iban_card" ||
        block.type === "board_members" ||
        block.type === "contact_card" ||
        block.type === "map" ||
        block.type === "card_grid") && (
        <div>
          <label className="block font-medium text-[#191919]">Açıklama / Alt Metin</label>
          <textarea
            rows={2}
            value={str("subtitle") || str("description")}
            onChange={(e) =>
              onUpdate(
                "subtitle" in d || block.type === "hero" || block.type === "stats" || block.type === "card_grid"
                  ? "subtitle"
                  : "description",
                e.target.value
              )
            }
            className="mt-1 w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
        </div>
      )}

      {(block.type === "rich_text" || block.type === "image_text") && (
        <div>
          <label className="block font-medium text-[#191919]">
            İçerik Metni (Markdown destekler: ## Başlık, **kalın**, - liste)
          </label>
          <textarea
            rows={5}
            value={block.type === "rich_text" ? str("content") : str("text")}
            onChange={(e) =>
              onUpdate(block.type === "rich_text" ? "content" : "text", e.target.value)
            }
            className="mt-1 w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
        </div>
      )}

      {(block.type === "hero" ||
        block.type === "image" ||
        block.type === "image_text") && (
        <div className="space-y-2 rounded-lg border border-[#e6e5e0] bg-white p-3">
          <label className="block font-medium text-[#191919]">Görsel URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={str("image_url")}
              onChange={(e) => onUpdate("image_url", e.target.value)}
              className="flex-1 rounded border border-[#e6e5e0] px-2.5 py-1.5"
            />
            <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1.5 font-medium hover:bg-[#f4f3ef]">
              <Upload className="h-3.5 w-3.5" />
              Yükle
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const url = await uploadFile(f);
                    if (url) onUpdate("image_url", url);
                  }
                }}
              />
            </label>
          </div>
          {galleryPhotos.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) onUpdate("image_url", e.target.value);
              }}
              className="w-full rounded border border-[#e6e5e0] px-2.5 py-1.5"
            >
              <option value="">Galeriden görsel seç...</option>
              {galleryPhotos.map((g) => (
                <option key={g.id} value={g.image_url}>
                  {g.title} ({g.album})
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder="Görsel Alt Açıklaması (SEO / Erişilebilirlik)"
            value={block.type === "image" ? str("alt") : str("image_alt")}
            onChange={(e) =>
              onUpdate(block.type === "image" ? "alt" : "image_alt", e.target.value)
            }
            className="w-full rounded border border-[#e6e5e0] px-2.5 py-1.5"
          />
        </div>
      )}

      {(block.type === "hero" || block.type === "cta") && (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            placeholder="1. Buton Etiketi"
            value={str("primary_label")}
            onChange={(e) => onUpdate("primary_label", e.target.value)}
            className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
          <input
            type="text"
            placeholder="1. Buton Bağlantısı (/koyumuz)"
            value={str("primary_href")}
            onChange={(e) => onUpdate("primary_href", e.target.value)}
            className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
          <input
            type="text"
            placeholder="2. Buton Etiketi"
            value={str("secondary_label")}
            onChange={(e) => onUpdate("secondary_label", e.target.value)}
            className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
          <input
            type="text"
            placeholder="2. Buton Bağlantısı"
            value={str("secondary_href")}
            onChange={(e) => onUpdate("secondary_href", e.target.value)}
            className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
        </div>
      )}

      {(block.type === "stats" || block.type === "timeline") && (
        <JsonArrayItemEditor
          label="Satır Öğeleri"
          items={Array.isArray(d.items) ? (d.items as Record<string, unknown>[]) : []}
          fields={
            block.type === "stats"
              ? ["label", "value", "subtext"]
              : ["year", "value", "note"]
          }
          onChange={(next) => onUpdate("items", next)}
        />
      )}

      {block.type === "card_grid" && (
        <JsonArrayItemEditor
          label="Kartlar"
          items={Array.isArray(d.cards) ? (d.cards as Record<string, unknown>[]) : []}
          fields={["badge", "title", "description", "link_label", "link_href"]}
          onChange={(next) => onUpdate("cards", next)}
        />
      )}

      {block.type === "faq" && (
        <JsonArrayItemEditor
          label="Soru-Cevaplar"
          items={Array.isArray(d.items) ? (d.items as Record<string, unknown>[]) : []}
          fields={["question", "answer"]}
          onChange={(next) => onUpdate("items", next)}
        />
      )}

      {block.type === "map" && (
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="number"
            step="0.000001"
            placeholder="Enlem (Lat)"
            value={typeof d.lat === "number" ? d.lat : 39.603056}
            onChange={(e) => onUpdate("lat", Number(e.target.value))}
            className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
          <input
            type="number"
            step="0.000001"
            placeholder="Boylam (Lng)"
            value={typeof d.lng === "number" ? d.lng : 36.438056}
            onChange={(e) => onUpdate("lng", Number(e.target.value))}
            className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
          <input
            type="number"
            placeholder="Yakınlaştırma (13)"
            value={typeof d.zoom === "number" ? d.zoom : 13}
            onChange={(e) => onUpdate("zoom", Number(e.target.value))}
            className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5"
          />
        </div>
      )}
    </div>
  );
}

function JsonArrayItemEditor({
  label,
  items,
  fields,
  onChange,
}: {
  label: string;
  items: Record<string, unknown>[];
  fields: string[];
  onChange: (next: Record<string, unknown>[]) => void;
}) {
  function addItem() {
    const empty: Record<string, unknown> = { id: `itm-${Date.now()}` };
    for (const f of fields) empty[f] = "";
    onChange([...items, empty]);
  }

  return (
    <div className="space-y-2 rounded-lg border border-[#e6e5e0] bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#191919]">
          {label} ({items.length})
        </span>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded border border-[#e6e5e0] bg-[#fbfbfa] px-2 py-1 text-[11px] font-medium hover:bg-[#f4f3ef]"
        >
          <Plus className="h-3 w-3" />
          Öğe Ekle
        </button>
      </div>
      {items.map((item, idx) => (
        <div
          key={(item.id as string) || idx}
          className="flex flex-wrap items-center gap-1.5 rounded border border-[#e6e5e0] bg-[#fbfbfa] p-2"
        >
          {fields.map((f) => (
            <input
              key={f}
              type="text"
              placeholder={f}
              value={typeof item[f] === "string" ? (item[f] as string) : ""}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...item, [f]: e.target.value };
                onChange(next);
              }}
              className="min-w-[110px] flex-1 rounded border border-[#e6e5e0] bg-white px-2 py-1 text-xs"
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="rounded border border-[#e6e5e0] bg-white p-1 text-red-600 hover:bg-red-50"
            title="Sil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
