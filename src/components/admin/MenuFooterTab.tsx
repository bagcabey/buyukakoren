"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Lock, Plus, Save, Trash2 } from "lucide-react";
import { NavItem, SiteSettings } from "@/lib/types";

export function MenuFooterTab({
  settings,
  setSettings,
  onSave,
}: {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  onSave: (e?: React.FormEvent) => Promise<void>;
}) {
  const navItems: NavItem[] = [...(settings.nav_items || [])].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99)
  );
  const footerLinks: NavItem[] = settings.footer_links || [];
  const social = settings.social_links || {};

  function updateNavItems(next: NavItem[]) {
    setSettings({
      ...settings,
      nav_items: next.map((item, idx) => ({ ...item, order: idx + 1 })),
    });
  }

  function moveNav(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= navItems.length) return;
    const copy = [...navItems];
    const tmp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = tmp;
    updateNavItems(copy);
  }

  function addNavItem() {
    updateNavItems([
      ...navItems,
      {
        id: `nav-${Date.now()}`,
        label: "Yeni Bağlantı",
        href: "/",
        visible: true,
        order: navItems.length + 1,
        is_external: false,
      },
    ]);
  }

  function addFooterLink() {
    setSettings({
      ...settings,
      footer_links: [
        ...footerLinks,
        {
          id: `fl-${Date.now()}`,
          label: "Yeni Alt Link",
          href: "/",
          visible: true,
          order: footerLinks.length + 1,
          is_external: false,
        },
      ],
    });
  }

  return (
    <form onSubmit={onSave} className="mt-6 space-y-6">
      {/* Atatürk Kuşağı */}
      <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
        <h2 className="text-base font-semibold text-[#191919]">
          Üst Kırmızı Atatürk Kuşağı
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 px-3 py-2 text-xs font-medium text-[#991b1b]">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>
              Zorunlu Kurumsal Kuşak (Kapatılamaz): Gazi Mustafa Kemal Atatürk ★ Sonsuza Dek
            </span>
          </div>
          <div>
            <input
              type="text"
              placeholder="Sonsuza Dek"
              value={settings.ataturk_ribbon_text ?? "Sonsuza Dek"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ataturk_ribbon_visible: true,
                  ataturk_ribbon_text: e.target.value,
                })
              }
              className="w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Üst Menü Öğeleri */}
      <div className="rounded-xl border border-[#e6e5e0] bg-white p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#191919]">
              Üst Navigasyon Menüsü ({navItems.length})
            </h2>
            <p className="text-xs text-[#666560]">
              Menü isimlerini, bağlantıları, görünürlüğü ve sıralamayı buradan yönetebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={addNavItem}
            className="inline-flex items-center justify-center gap-1 self-start rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium hover:bg-[#f4f3ef] sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Öğe Ekle
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {navItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] p-2.5 sm:flex-row sm:items-center"
            >
              <div className="flex items-center justify-between gap-1 sm:justify-start">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveNav(idx, -1)}
                    className="rounded border border-[#e6e5e0] bg-white p-1.5 text-[#666560] hover:text-[#191919]"
                    title="Yukarı Taşı"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveNav(idx, 1)}
                    className="rounded border border-[#e6e5e0] bg-white p-1.5 text-[#666560] hover:text-[#191919]"
                    title="Aşağı Taşı"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Mobile action controls */}
                <div className="flex items-center gap-1.5 sm:hidden">
                  <label className="inline-flex items-center gap-1 rounded border border-[#e6e5e0] bg-white px-2 py-1 text-[11px] text-[#666560]">
                    <input
                      type="checkbox"
                      checked={Boolean(item.is_external)}
                      onChange={(e) => {
                        const next = [...navItems];
                        next[idx] = { ...item, is_external: e.target.checked };
                        updateNavItems(next);
                      }}
                    />
                    Dış Link
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...navItems];
                      next[idx] = { ...item, visible: !item.visible };
                      updateNavItems(next);
                    }}
                    className="rounded border border-[#e6e5e0] bg-white p-1.5 text-[#666560] hover:text-[#191919]"
                    title={item.visible ? "Gizle" : "Göster"}
                  >
                    {item.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-amber-700" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateNavItems(navItems.filter((n) => n.id !== item.id))
                    }
                    className="rounded border border-[#e6e5e0] bg-white p-1.5 text-red-600 hover:bg-red-50"
                    title="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Text inputs */}
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Menü Adı"
                  value={item.label}
                  onChange={(e) => {
                    const next = [...navItems];
                    next[idx] = { ...item, label: e.target.value };
                    updateNavItems(next);
                  }}
                  className="w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs font-medium sm:min-w-[140px] sm:flex-1"
                />
                <input
                  type="text"
                  placeholder="URL (/sayfa veya https://...)"
                  value={item.href}
                  onChange={(e) => {
                    const next = [...navItems];
                    next[idx] = { ...item, href: e.target.value };
                    updateNavItems(next);
                  }}
                  className="w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5 font-mono text-xs sm:min-w-[140px] sm:flex-1"
                />
              </div>

              {/* Desktop action controls */}
              <div className="hidden sm:flex sm:items-center sm:gap-1.5">
                <label className="inline-flex items-center gap-1 rounded border border-[#e6e5e0] bg-white px-2 py-1.5 text-[11px]">
                  <input
                    type="checkbox"
                    checked={Boolean(item.is_external)}
                    onChange={(e) => {
                      const next = [...navItems];
                      next[idx] = { ...item, is_external: e.target.checked };
                      updateNavItems(next);
                    }}
                  />
                  Dış Link
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...navItems];
                    next[idx] = { ...item, visible: !item.visible };
                    updateNavItems(next);
                  }}
                  className="rounded border border-[#e6e5e0] bg-white p-1.5 text-[#666560] hover:text-[#191919]"
                  title={item.visible ? "Gizle" : "Göster"}
                >
                  {item.visible ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-amber-700" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateNavItems(navItems.filter((n) => n.id !== item.id))
                  }
                  className="rounded border border-[#e6e5e0] bg-white p-1.5 text-red-600 hover:bg-red-50"
                  title="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Metni ve Sosyal Medya */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <h2 className="text-base font-semibold text-[#191919]">
            Alt Bilgi (Footer) Metni & Ek Bağlantılar
          </h2>
          <textarea
            rows={3}
            value={settings.footer_description || ""}
            onChange={(e) =>
              setSettings({ ...settings, footer_description: e.target.value })
            }
            className="w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            placeholder="Dernek alt bilgi açıklaması..."
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-medium text-[#191919]">
              Özel Alt Bilgi Bağlantıları
            </span>
            <button
              type="button"
              onClick={addFooterLink}
              className="inline-flex items-center gap-1 rounded border border-[#e6e5e0] bg-white px-2.5 py-1 text-[11px] font-medium"
            >
              <Plus className="h-3 w-3" />
              Ekle
            </button>
          </div>
          {footerLinks.map((fl, idx) => (
            <div
              key={fl.id}
              className="flex flex-col gap-2 rounded-lg border border-[#e6e5e0] bg-white p-2.5 sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
            >
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder="Etiket"
                  value={fl.label}
                  onChange={(e) => {
                    const next = [...footerLinks];
                    next[idx] = { ...fl, label: e.target.value };
                    setSettings({ ...settings, footer_links: next });
                  }}
                  className="w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs sm:flex-1"
                />
                <input
                  type="text"
                  placeholder="URL (/sayfa veya https://...)"
                  value={fl.href}
                  onChange={(e) => {
                    const next = [...footerLinks];
                    next[idx] = { ...fl, href: e.target.value };
                    setSettings({ ...settings, footer_links: next });
                  }}
                  className="w-full rounded border border-[#e6e5e0] bg-white px-2.5 py-1.5 font-mono text-xs sm:flex-1"
                />
              </div>
              <div className="flex justify-end sm:justify-start">
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      footer_links: footerLinks.filter((x) => x.id !== fl.id),
                    })
                  }
                  className="rounded border border-[#e6e5e0] bg-white p-1.5 text-red-600 hover:bg-red-50"
                  title="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <h2 className="text-base font-semibold text-[#191919]">
            Resmî Sosyal Medya Bağlantıları (Boş bırakılanlar gizlenir)
          </h2>
          {(
            [
              ["facebook", "Facebook URL"],
              ["instagram", "Instagram URL"],
              ["youtube", "YouTube Kanal URL"],
              ["twitter", "X (Twitter) URL"],
              ["whatsapp", "WhatsApp Grup / İletişim URL"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#191919]">
                {label}
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={social[key] || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_links: { ...social, [key]: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg bg-[#191919] px-6 py-3 text-sm font-medium text-white hover:bg-[#333333]"
      >
        <Save className="h-4 w-4" />
        Menü ve Alt Bilgi Ayarlarını Kaydet
      </button>
    </form>
  );
}
