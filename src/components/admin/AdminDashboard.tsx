"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  HeartHandshake,
  Images,
  LogOut,
  Mail,
  Phone,
  Pin,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { CATEGORY_LABELS, formatDateTR } from "@/lib/format";
import {
  BoardMember,
  Condolence,
  GalleryPhoto,
  Post,
  PostCategory,
  ProjectStatus,
  SiteSettings,
  StoreData,
} from "@/lib/types";

type TabKey = "posts" | "condolences" | "gallery" | "settings" | "messages";

export function AdminDashboard({ initialData }: { initialData: StoreData }) {
  const router = useRouter();
  const [data, setData] = useState<StoreData>(initialData);
  const [tab, setTab] = useState<TabKey>("posts");
  const [mobileFormOpen, setMobileFormOpen] = useState<{
    posts: boolean;
    condolences: boolean;
    gallery: boolean;
  }>({ posts: false, condolences: false, gallery: false });
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(
    null
  );

  function notify(msg: string, err = false) {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3200);
  }

  async function refreshAll() {
    const [pRes, cRes, gRes, sRes, mRes] = await Promise.all([
      fetch("/api/posts", { cache: "no-store" }),
      fetch("/api/condolences", { cache: "no-store" }),
      fetch("/api/gallery", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/contact", { cache: "no-store" }),
    ]);
    const [p, c, g, s, m] = await Promise.all([
      pRes.json(),
      cRes.json(),
      gRes.json(),
      sRes.json(),
      mRes.json(),
    ]);
    setData({
      posts: p.posts || [],
      condolences: c.condolences || [],
      gallery_photos: g.gallery_photos || [],
      board_members: s.board_members || [],
      site_settings: s.site_settings || initialData.site_settings,
      contact_messages: m.messages || [],
    });
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      notify("Dosya yüklenemedi.", true);
      return null;
    }
    const j = (await res.json()) as { url: string };
    notify("Dosya başarıyla yüklendi.");
    return j.url;
  }

  // --- POSTS STATE ---
  const [postSearch, setPostSearch] = useState("");
  const [postFilter, setPostFilter] = useState<string>("tumu");
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [postCategory, setPostCategory] = useState<PostCategory>("duyuru");
  const [postTitle, setPostTitle] = useState("");
  const [postSummary, setPostSummary] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postAttachment, setPostAttachment] = useState("");
  const [postStatus, setPostStatus] = useState<ProjectStatus | "">("");
  const [postPinned, setPostPinned] = useState(false);
  const [postPublished, setPostPublished] = useState(true);

  function loadPostForEdit(p: Post) {
    setEditingId(p.id);
    setPostCategory(p.category);
    setPostTitle(p.title);
    setPostSummary(p.summary);
    setPostContent(p.content);
    setPostImage(p.image_url || "");
    setPostAttachment(p.attachment_url || "");
    setPostStatus(p.project_status || "");
    setPostPinned(p.is_pinned);
    setPostPublished(p.is_published);
    setMobileFormOpen((prev) => ({ ...prev, posts: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetPostForm() {
    setEditingId(undefined);
    setPostCategory("duyuru");
    setPostTitle("");
    setPostSummary("");
    setPostContent("");
    setPostImage("");
    setPostAttachment("");
    setPostStatus("");
    setPostPinned(false);
    setPostPublished(true);
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId,
        category: postCategory,
        title: postTitle,
        summary: postSummary,
        content: postContent,
        image_url: postImage || null,
        attachment_url: postAttachment || null,
        project_status:
          postCategory === "faaliyet" && postStatus ? postStatus : null,
        is_pinned: postPinned,
        is_published: postPublished,
      }),
    });
    if (res.ok) {
      resetPostForm();
      await refreshAll();
      notify("İçerik kaydedildi.");
    } else {
      notify("Kayıt sırasında hata oluştu.", true);
    }
  }

  async function quickTogglePost(
    p: Post,
    field: "is_pinned" | "is_published"
  ) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...p,
        [field]: !p[field],
      }),
    });
    if (res.ok) {
      await refreshAll();
      notify(
        field === "is_pinned"
          ? !p.is_pinned
            ? "Duyuru ana sayfaya sabitlendi."
            : "Sabitleme kaldırıldı."
          : !p.is_published
          ? "İçerik yayına alındı."
          : "İçerik taslağa çekildi."
      );
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm("Bu içeriği silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    await refreshAll();
    notify("İçerik silindi.");
  }

  const filteredPosts = data.posts.filter((p) => {
    const matchesSearch =
      !postSearch.trim() ||
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.summary.toLowerCase().includes(postSearch.toLowerCase());
    const matchesFilter =
      postFilter === "tumu"
        ? true
        : postFilter === "taslak"
        ? !p.is_published
        : p.category === postFilter;
    return matchesSearch && matchesFilter;
  });

  // --- CONDOLENCE STATE ---
  const [editingCondId, setEditingCondId] = useState<string | undefined>(
    undefined
  );
  const [deceasedName, setDeceasedName] = useState("");
  const [ageOrNote, setAgeOrNote] = useState("");
  const [funeralDate, setFuneralDate] = useState("");
  const [burialPlace, setBurialPlace] = useState("Büyük Akören Köyü Mezarlığı");
  const [condMessage, setCondMessage] = useState(
    "Merhuma/Merhumeye Allah'tan rahmet, kederli ailesine ve tüm hemşehrilerimize başsağlığı dileriz."
  );
  const [relatives, setRelatives] = useState("");
  const [condPublished, setCondPublished] = useState(true);

  function loadCondForEdit(c: Condolence) {
    setEditingCondId(c.id);
    setDeceasedName(c.deceased_name);
    setAgeOrNote(c.age_or_note || "");
    setFuneralDate(c.funeral_date);
    setBurialPlace(c.burial_place);
    setCondMessage(c.message);
    setRelatives(c.relatives || "");
    setCondPublished(c.is_published);
    setMobileFormOpen((prev) => ({ ...prev, condolences: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetCondForm() {
    setEditingCondId(undefined);
    setDeceasedName("");
    setAgeOrNote("");
    setFuneralDate("");
    setBurialPlace("Büyük Akören Köyü Mezarlığı");
    setCondMessage(
      "Merhuma/Merhumeye Allah'tan rahmet, kederli ailesine ve tüm hemşehrilerimize başsağlığı dileriz."
    );
    setRelatives("");
    setCondPublished(true);
  }

  async function handleSaveCondolence(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/condolences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingCondId,
        deceased_name: deceasedName,
        age_or_note: ageOrNote,
        funeral_date: funeralDate,
        burial_place: burialPlace,
        message: condMessage,
        relatives,
        is_published: condPublished,
      }),
    });
    if (res.ok) {
      resetCondForm();
      await refreshAll();
      notify("Taziye ilanı kaydedildi.");
    }
  }

  async function toggleCondPublished(c: Condolence) {
    const res = await fetch("/api/condolences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, is_published: !c.is_published }),
    });
    if (res.ok) {
      await refreshAll();
      notify(c.is_published ? "Taziye gizlendi." : "Taziye yayınlandı.");
    }
  }

  async function handleDeleteCondolence(id: string) {
    if (!confirm("Bu taziye ilanını silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/condolences?id=${id}`, { method: "DELETE" });
    await refreshAll();
    notify("Taziye ilanı silindi.");
  }

  // --- GALLERY STATE ---
  const [galFilter, setGalFilter] = useState("Tümü");
  const [editingGalId, setEditingGalId] = useState<string | undefined>(
    undefined
  );
  const [galTitle, setGalTitle] = useState("");
  const [galAlbum, setGalAlbum] = useState("Köyümüzden Kareler");
  const [galUrl, setGalUrl] = useState("");
  const [galYear, setGalYear] = useState("2026");

  function loadGalForEdit(g: GalleryPhoto) {
    setEditingGalId(g.id);
    setGalTitle(g.title);
    setGalAlbum(g.album);
    setGalUrl(g.image_url);
    setGalYear(g.taken_year || "");
    setMobileFormOpen((prev) => ({ ...prev, gallery: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetGalForm() {
    setEditingGalId(undefined);
    setGalTitle("");
    setGalAlbum("Köyümüzden Kareler");
    setGalUrl("");
    setGalYear("2026");
  }

  async function handleSaveGallery(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingGalId,
        title: galTitle,
        album: galAlbum,
        image_url: galUrl,
        taken_year: galYear,
      }),
    });
    if (res.ok) {
      resetGalForm();
      await refreshAll();
      notify("Galeri fotoğrafı kaydedildi.");
    }
  }

  async function handleDeleteGallery(id: string) {
    if (!confirm("Bu fotoğrafı galeriden kaldırmak istediğinize emin misiniz?"))
      return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    await refreshAll();
    notify("Fotoğraf kaldırıldı.");
  }

  const albums = [
    "Tümü",
    ...Array.from(new Set(data.gallery_photos.map((g) => g.album))),
  ];
  const filteredGallery =
    galFilter === "Tümü"
      ? data.gallery_photos
      : data.gallery_photos.filter((g) => g.album === galFilter);

  // --- SETTINGS & BOARD STATE ---
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(
    data.site_settings
  );
  const [boardForm, setBoardForm] = useState<BoardMember[]>(
    data.board_members
  );

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    const orderedBoard = boardForm.map((m, i) => ({
      ...m,
      display_order: i + 1,
    }));
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_settings: settingsForm,
        board_members: orderedBoard,
      }),
    });
    if (res.ok) {
      await refreshAll();
      notify("Site ayarları ve yönetim kurulu güncellendi.");
    }
  }

  function addBoardMember() {
    setBoardForm((prev) => [
      ...prev,
      {
        id: `bm-${Date.now()}`,
        full_name: "",
        role: "Yönetim Kurulu Üyesi",
        bio: "",
        display_order: prev.length + 1,
      },
    ]);
  }

  function moveBoardMember(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= boardForm.length) return;
    const copy = [...boardForm];
    const temp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = temp;
    setBoardForm(copy);
  }

  // --- MESSAGES ---
  const [msgFilter, setMsgFilter] = useState<"all" | "unread">("all");

  async function handleMarkRead(id: string) {
    await fetch(`/api/contact?id=${id}`, { method: "PATCH" });
    await refreshAll();
    notify("Mesaj okundu olarak işaretlendi.");
  }

  async function handleDeleteMessage(id: string) {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
    await refreshAll();
    notify("Mesaj silindi.");
  }

  const unreadCount = data.contact_messages.filter((m) => !m.is_read).length;
  const publishedPostsCount = data.posts.filter((p) => p.is_published).length;
  const filteredMessages =
    msgFilter === "unread"
      ? data.contact_messages.filter((m) => !m.is_read)
      : data.contact_messages;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6e5e0] pb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
            B.Akören Yönetim
          </p>
          <h1 className="mt-0.5 text-xl font-semibold text-[#191919] sm:text-2xl">
            Yönetici Kontrol Paneli
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs font-medium text-[#191919] hover:bg-[#fbfbfa]"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#666560]" />
            Siteyi Görüntüle
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Quick Control Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 text-left transition-colors hover:border-[#cfcec8]"
        >
          <p className="text-xs text-[#666560]">Yayındaki İçerik</p>
          <p className="mt-1 text-2xl font-semibold text-[#191919]">
            {publishedPostsCount}
            <span className="ml-1.5 text-xs font-normal text-[#666560]">
              / {data.posts.length}
            </span>
          </p>
        </button>
        <button
          type="button"
          onClick={() => setTab("condolences")}
          className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 text-left transition-colors hover:border-[#cfcec8]"
        >
          <p className="text-xs text-[#666560]">Taziye İlanı</p>
          <p className="mt-1 text-2xl font-semibold text-[#191919]">
            {data.condolences.length}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setTab("gallery")}
          className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 text-left transition-colors hover:border-[#cfcec8]"
        >
          <p className="text-xs text-[#666560]">Galeri Görseli</p>
          <p className="mt-1 text-2xl font-semibold text-[#191919]">
            {data.gallery_photos.length}
          </p>
        </button>
        <button
          type="button"
          onClick={() => setTab("messages")}
          className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 text-left transition-colors hover:border-[#cfcec8]"
        >
          <p className="text-xs text-[#666560]">Okunmamış Mesaj</p>
          <p className="mt-1 text-2xl font-semibold text-[#191919]">
            {unreadCount}
          </p>
        </button>
      </div>

      {toast && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium ${
            toast.err
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast.msg}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="no-scrollbar mt-6 flex flex-nowrap gap-2 overflow-x-auto border-b border-[#e6e5e0] pb-4 sm:flex-wrap sm:overflow-visible">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            tab === "posts"
              ? "bg-[#191919] text-white"
              : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Duyuru, Haber & Faaliyet ({data.posts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("condolences")}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            tab === "condolences"
              ? "bg-[#191919] text-white"
              : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
          }`}
        >
          <HeartHandshake className="h-3.5 w-3.5" />
          Taziye İlanları ({data.condolences.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("gallery")}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            tab === "gallery"
              ? "bg-[#191919] text-white"
              : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
          }`}
        >
          <Images className="h-3.5 w-3.5" />
          Galeri ({data.gallery_photos.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("settings")}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            tab === "settings"
              ? "bg-[#191919] text-white"
              : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          Ayarlar & Yönetim
        </button>
        <button
          type="button"
          onClick={() => setTab("messages")}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
            tab === "messages"
              ? "bg-[#191919] text-white"
              : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          Gelen Mesajlar {unreadCount > 0 ? `(${unreadCount} yeni)` : ""}
        </button>
      </div>

      {/* TAB 1: POSTS */}
      {tab === "posts" && (
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={() =>
                setMobileFormOpen((prev) => ({ ...prev, posts: !prev.posts }))
              }
              className="flex w-full items-center justify-between rounded-xl border border-[#e6e5e0] bg-[#191919] px-4 py-3 text-sm font-medium text-white lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingId ? "İçerik Düzenleme Formu" : "Yeni İçerik Formunu Aç / Kapat"}
              </span>
              {mobileFormOpen.posts ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <form
              onSubmit={handleSavePost}
              className={`${
                mobileFormOpen.posts ? "mt-3 block" : "hidden"
              } space-y-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 sm:p-5 lg:mt-0 lg:block`}
            >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#191919]">
                {editingId ? "İçeriği Düzenle" : "Yeni İçerik Ekle"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetPostForm}
                  className="text-xs text-[#666560] underline"
                >
                  Yeni Kayda Geç
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Tür
                </label>
                <select
                  value={postCategory}
                  onChange={(e) =>
                    setPostCategory(e.target.value as PostCategory)
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                >
                  <option value="duyuru">Duyuru</option>
                  <option value="haber">Haber</option>
                  <option value="aciklama">Resmî Açıklama</option>
                  <option value="faaliyet">Faaliyet Raporu</option>
                </select>
              </div>

              {postCategory === "faaliyet" && (
                <div>
                  <label className="block text-xs font-medium text-[#191919]">
                    Proje Durumu
                  </label>
                  <select
                    value={postStatus}
                    onChange={(e) =>
                      setPostStatus(e.target.value as ProjectStatus | "")
                    }
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Seçiniz</option>
                    <option value="planlandi">Planlandı</option>
                    <option value="devam_ediyor">Devam Ediyor</option>
                    <option value="tamamlandi">Tamamlandı</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Başlık *
              </label>
              <input
                type="text"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Örn. Köy Yolu Çalışması Hakkında Duyuru"
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Kısa Özet *
              </label>
              <textarea
                required
                rows={2}
                value={postSummary}
                onChange={(e) => setPostSummary(e.target.value)}
                placeholder="Kartlarda görünecek 1-2 cümlelik özet..."
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Detaylı İçerik *
              </label>
              <textarea
                required
                rows={5}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Haberin veya açıklamanın tam metni..."
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Görsel (Yükle, Galeriden Seç veya URL Gir)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  placeholder="/images/koy/01_koy_panoramik.jpg"
                  className="flex-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
                />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs font-medium hover:bg-[#f4f3ef]">
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
                        if (url) setPostImage(url);
                      }
                    }}
                  />
                </label>
              </div>
              {data.gallery_photos.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setPostImage(e.target.value);
                  }}
                  className="mt-2 w-full rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs text-[#666560]"
                >
                  <option value="">Mevcut galeriden görsel seç...</option>
                  {data.gallery_photos.map((g) => (
                    <option key={g.id} value={g.image_url}>
                      {g.title} ({g.album})
                    </option>
                  ))}
                </select>
              )}
              {postImage && (
                <div className="mt-2 overflow-hidden rounded-lg border border-[#e6e5e0] bg-white p-1">
                  <img
                    src={postImage}
                    alt="Önizleme"
                    className="h-28 w-full rounded object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Ek Belge / PDF (İsteğe Bağlı)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={postAttachment}
                  onChange={(e) => setPostAttachment(e.target.value)}
                  placeholder="PDF veya belge bağlantısı..."
                  className="flex-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
                />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs font-medium hover:bg-[#f4f3ef]">
                  <Upload className="h-3.5 w-3.5" />
                  Belge
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const url = await uploadFile(f);
                        if (url) setPostAttachment(url);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-[#191919]">
                <input
                  type="checkbox"
                  checked={postPinned}
                  onChange={(e) => setPostPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-[#e6e5e0]"
                />
                Ana sayfanın en üstüne sabitle (Acil / Önemli Duyuru)
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-[#191919]">
                <input
                  type="checkbox"
                  checked={postPublished}
                  onChange={(e) => setPostPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-[#e6e5e0]"
                />
                Hemen yayınla (İşaret kaldırılırsa taslak olarak saklanır)
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333333]"
            >
              <Plus className="h-4 w-4" />
              {editingId ? "Değişiklikleri Kaydet" : "Kaydet ve Yayınla"}
            </button>
          </form>
          </div>

          <div className="space-y-4 lg:col-span-7">
            {/* Search & Filter Controls */}
            <div className="flex flex-col gap-3 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4">
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-[#666560]" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  placeholder="Başlık veya özet içinde ara..."
                  className="w-full rounded-lg border border-[#e6e5e0] bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-[#191919]"
                />
              </div>
              <div className="no-scrollbar flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {[
                  { k: "tumu", l: "Tümü" },
                  { k: "duyuru", l: "Duyuru" },
                  { k: "haber", l: "Haber" },
                  { k: "aciklama", l: "Açıklama" },
                  { k: "faaliyet", l: "Faaliyet" },
                  { k: "taslak", l: "Taslaklar" },
                ].map((f) => (
                  <button
                    key={f.k}
                    type="button"
                    onClick={() => setPostFilter(f.k)}
                    className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      postFilter === f.k
                        ? "bg-[#191919] text-white"
                        : "border border-[#e6e5e0] bg-white text-[#666560] hover:text-[#191919]"
                    }`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-8 text-center text-sm text-[#666560]">
                Aramanızla eşleşen içerik bulunamadı.
              </div>
            ) : (
              filteredPosts.map((p) => (
                <div
                  key={p.id}
                  className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:gap-4 ${
                    p.is_published
                      ? "border-[#e6e5e0] bg-white"
                      : "border-dashed border-[#cfcec8] bg-[#fbfbfa]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#666560]">
                      <span className="rounded bg-[#f4f3ef] px-2 py-0.5 font-medium text-[#191919]">
                        {CATEGORY_LABELS[p.category]}
                      </span>
                      {p.is_pinned && (
                        <span className="rounded bg-[#191919] px-2 py-0.5 text-white">
                          Sabit
                        </span>
                      )}
                      {!p.is_published && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                          Taslak
                        </span>
                      )}
                      <span>{formatDateTR(p.published_at)}</span>
                    </div>
                    <p className="mt-1.5 font-semibold text-[#191919]">
                      {p.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[#666560]">
                      {p.summary}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-[#e6e5e0] pt-2.5 sm:border-0 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => quickTogglePost(p, "is_pinned")}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-medium ${
                        p.is_pinned
                          ? "border-[#191919] bg-[#191919] text-white"
                          : "border-[#e6e5e0] text-[#666560] hover:bg-[#fbfbfa]"
                      }`}
                      title={p.is_pinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
                    >
                      <Pin className="h-3.5 w-3.5" />
                      <span className="sm:hidden">Sabitle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickTogglePost(p, "is_published")}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] px-2.5 py-2 text-xs font-medium text-[#666560] hover:bg-[#fbfbfa] hover:text-[#191919]"
                      title={p.is_published ? "Taslağa Çek" : "Yayınla"}
                    >
                      {p.is_published ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      <span className="sm:hidden">
                        {p.is_published ? "Yayında" : "Taslak"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadPostForEdit(p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] px-2.5 py-2 text-xs font-medium text-[#666560] hover:bg-[#fbfbfa] hover:text-[#191919]"
                      title="Düzenle"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span className="sm:hidden">Düzenle</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(p.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sm:hidden">Sil</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONDOLENCES */}
      {tab === "condolences" && (
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <button
              type="button"
              onClick={() =>
                setMobileFormOpen((prev) => ({
                  ...prev,
                  condolences: !prev.condolences,
                }))
              }
              className="flex w-full items-center justify-between rounded-xl border border-[#e6e5e0] bg-[#191919] px-4 py-3 text-sm font-medium text-white lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingCondId
                  ? "Taziye Düzenleme Formu"
                  : "Yeni Taziye Formunu Aç / Kapat"}
              </span>
              {mobileFormOpen.condolences ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <form
              onSubmit={handleSaveCondolence}
              className={`${
                mobileFormOpen.condolences ? "mt-3 block" : "hidden"
              } space-y-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 sm:p-5 lg:mt-0 lg:block`}
            >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#191919]">
                {editingCondId ? "Taziye İlanını Düzenle" : "Yeni Taziye İlanı Ekle"}
              </h2>
              {editingCondId && (
                <button
                  type="button"
                  onClick={resetCondForm}
                  className="text-xs text-[#666560] underline"
                >
                  Vazgeç
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Merhum / Merhume Adı Soyadı *
              </label>
              <input
                type="text"
                required
                value={deceasedName}
                onChange={(e) => setDeceasedName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Lakap / Kısa Bilgi
              </label>
              <input
                type="text"
                value={ageOrNote}
                onChange={(e) => setAgeOrNote(e.target.value)}
                placeholder="Örn. Yukarı Mahalle sakinlerinden"
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Cenaze Tarihi ve Vakti *
              </label>
              <input
                type="text"
                required
                value={funeralDate}
                onChange={(e) => setFuneralDate(e.target.value)}
                placeholder="Örn. 14 Kasım, Öğle namazına müteakip"
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Defin Yeri
              </label>
              <input
                type="text"
                value={burialPlace}
                onChange={(e) => setBurialPlace(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Taziye Mesajı
              </label>
              <textarea
                rows={3}
                value={condMessage}
                onChange={(e) => setCondMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Yakınları / İlanı Veren
              </label>
              <input
                type="text"
                value={relatives}
                onChange={(e) => setRelatives(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#191919]">
              <input
                type="checkbox"
                checked={condPublished}
                onChange={(e) => setCondPublished(e.target.checked)}
                className="h-4 w-4 rounded border-[#e6e5e0]"
              />
              Sitede yayında göster
            </label>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333333]"
            >
              {editingCondId ? "Güncelle" : "Taziye İlanını Yayınla"}
            </button>
          </form>
          </div>

          <div className="space-y-3 lg:col-span-7">
            <h2 className="text-base font-semibold text-[#191919]">
              Mevcut Taziye İlanları
            </h2>
            {data.condolences.map((c) => (
              <div
                key={c.id}
                className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:gap-4 ${
                  c.is_published
                    ? "border-[#e6e5e0] bg-white"
                    : "border-dashed border-[#cfcec8] bg-[#fbfbfa]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#191919]">
                      {c.deceased_name}
                    </p>
                    {!c.is_published && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                        Gizli
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#666560]">
                    {c.funeral_date} • {c.burial_place}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-[#e6e5e0] pt-2.5 sm:border-0 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => toggleCondPublished(c)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] px-2.5 py-2 text-xs font-medium text-[#666560] hover:bg-[#fbfbfa]"
                    title={c.is_published ? "Gizle" : "Yayınla"}
                  >
                    {c.is_published ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    <span className="sm:hidden">
                      {c.is_published ? "Yayında" : "Gizli"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadCondForEdit(c)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] px-2.5 py-2 text-xs font-medium text-[#666560] hover:bg-[#fbfbfa]"
                    title="Düzenle"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span className="sm:hidden">Düzenle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCondolence(c.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    title="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sm:hidden">Sil</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GALLERY */}
      {tab === "gallery" && (
        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={() =>
                setMobileFormOpen((prev) => ({
                  ...prev,
                  gallery: !prev.gallery,
                }))
              }
              className="flex w-full items-center justify-between rounded-xl border border-[#e6e5e0] bg-[#191919] px-4 py-3 text-sm font-medium text-white lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingGalId
                  ? "Fotoğraf Düzenleme Formu"
                  : "Yeni Fotoğraf Formunu Aç / Kapat"}
              </span>
              {mobileFormOpen.gallery ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <form
              onSubmit={handleSaveGallery}
              className={`${
                mobileFormOpen.gallery ? "mt-3 block" : "hidden"
              } space-y-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 sm:p-5 lg:mt-0 lg:block`}
            >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#191919]">
                {editingGalId ? "Fotoğrafı Düzenle" : "Galeriye Fotoğraf Ekle"}
              </h2>
              {editingGalId && (
                <button
                  type="button"
                  onClick={resetGalForm}
                  className="text-xs text-[#666560] underline"
                >
                  Vazgeç
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Fotoğraf Başlığı *
              </label>
              <input
                type="text"
                required
                value={galTitle}
                onChange={(e) => setGalTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Albüm Adı
              </label>
              <input
                type="text"
                value={galAlbum}
                onChange={(e) => setGalAlbum(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Yıl / Dönem
              </label>
              <input
                type="text"
                value={galYear}
                onChange={(e) => setGalYear(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Görsel Dosyası veya URL *
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  required
                  value={galUrl}
                  onChange={(e) => setGalUrl(e.target.value)}
                  placeholder="/uploads/..."
                  className="flex-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
                />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs font-medium hover:bg-[#f4f3ef]">
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
                        if (url) setGalUrl(url);
                      }
                    }}
                  />
                </label>
              </div>
              {galUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-[#e6e5e0] bg-white p-1">
                  <img
                    src={galUrl}
                    alt="Önizleme"
                    className="h-32 w-full rounded object-cover"
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#333333]"
            >
              {editingGalId ? "Fotoğrafı Güncelle" : "Galeriye Ekle"}
            </button>
          </form>
          </div>

          <div className="space-y-4 lg:col-span-8">
            <div className="no-scrollbar flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {albums.map((alb) => (
                <button
                  key={alb}
                  type="button"
                  onClick={() => setGalFilter(alb)}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium ${
                    galFilter === alb
                      ? "bg-[#191919] text-white"
                      : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
                  }`}
                >
                  {alb}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredGallery.map((g) => (
                <div
                  key={g.id}
                  className="overflow-hidden rounded-xl border border-[#e6e5e0] bg-white"
                >
                  <img
                    src={g.image_url}
                    alt={g.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#191919]">
                        {g.title}
                      </p>
                      <p className="text-xs text-[#666560]">
                        {g.album} {g.taken_year ? `• ${g.taken_year}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => loadGalForEdit(g)}
                        className="rounded-md border border-[#e6e5e0] p-2 text-[#666560] hover:bg-[#fbfbfa]"
                        title="Düzenle"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGallery(g.id)}
                        className="rounded-md border border-[#e6e5e0] p-2 text-red-600 hover:bg-red-50"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & BOARD */}
      {tab === "settings" && (
        <form onSubmit={handleSaveSettings} className="mt-8 space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* General & Phone Settings */}
            <div className="space-y-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-6">
              <h2 className="text-base font-semibold text-[#191919]">
                Genel & İletişim Ayarları
              </h2>
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Dernek Tam Adı
                </label>
                <input
                  type="text"
                  value={settingsForm.association_name}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      association_name: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Ana Sayfa Başlığı
                </label>
                <input
                  type="text"
                  value={settingsForm.hero_title}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      hero_title: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Ana Sayfa Alt Açıklama
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.hero_subtitle}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      hero_subtitle: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>

              {/* Optional Association Phone */}
              <div className="rounded-lg border border-[#e6e5e0] bg-white p-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#191919]">
                  <input
                    type="checkbox"
                    checked={settingsForm.show_association_phone}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        show_association_phone: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#e6e5e0]"
                  />
                  Sitede Dernek Telefon Numarasını Göster (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={settingsForm.association_phone || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      association_phone: e.target.value,
                    })
                  }
                  placeholder="05XX XXX XX XX (Boş bırakılabilir)"
                  className="mt-2.5 w-full rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Köy Muhtarlığı İletişim Numarası (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={settingsForm.mukhtar_phone || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      mukhtar_phone: e.target.value,
                    })
                  }
                  placeholder="İstenirse muhtarlık telefonu eklenebilir (isim yazılmaz)"
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* IBAN & Address */}
            <div className="space-y-4 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-6">
              <h2 className="text-base font-semibold text-[#191919]">
                IBAN & Adres Bilgileri
              </h2>
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  IBAN Numarası
                </label>
                <input
                  type="text"
                  value={settingsForm.iban_number || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      iban_number: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#191919]">
                    Banka Adı
                  </label>
                  <input
                    type="text"
                    value={settingsForm.iban_bank || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        iban_bank: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#191919]">
                    Hesap Sahibi
                  </label>
                  <input
                    type="text"
                    value={settingsForm.iban_account_name || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        iban_account_name: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Bağış / Aidat Açıklama Notu
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.donation_note || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      donation_note: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Dernek Adresi
                </label>
                <input
                  type="text"
                  value={settingsForm.association_address || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      association_address: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  E-posta
                </label>
                <input
                  type="email"
                  value={settingsForm.association_email || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      association_email: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Board Members */}
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#191919]">
                Yönetim Kurulu Üyeleri
              </h2>
              <button
                type="button"
                onClick={addBoardMember}
                className="inline-flex items-center gap-1 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-1.5 text-xs font-medium hover:bg-[#f4f3ef]"
              >
                <Plus className="h-3.5 w-3.5" />
                Üye Ekle
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {boardForm.map((m, idx) => (
                <div
                  key={m.id}
                  className="grid items-center gap-2 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] p-3 sm:grid-cols-12"
                >
                  <div className="flex gap-1 sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => moveBoardMember(idx, -1)}
                      className="rounded border border-[#e6e5e0] bg-white p-1.5 text-[#666560] hover:text-[#191919]"
                      title="Yukarı Taşı"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBoardMember(idx, 1)}
                      className="rounded border border-[#e6e5e0] bg-white p-1.5 text-[#666560] hover:text-[#191919]"
                      title="Aşağı Taşı"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={m.full_name}
                    onChange={(e) => {
                      const next = [...boardForm];
                      next[idx] = { ...m, full_name: e.target.value };
                      setBoardForm(next);
                    }}
                    className="rounded-md border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-sm sm:col-span-3"
                  />
                  <input
                    type="text"
                    placeholder="Görevi"
                    value={m.role}
                    onChange={(e) => {
                      const next = [...boardForm];
                      next[idx] = { ...m, role: e.target.value };
                      setBoardForm(next);
                    }}
                    className="rounded-md border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-sm sm:col-span-3"
                  />
                  <input
                    type="text"
                    placeholder="Kısa Açıklama"
                    value={m.bio || ""}
                    onChange={(e) => {
                      const next = [...boardForm];
                      next[idx] = { ...m, bio: e.target.value };
                      setBoardForm(next);
                    }}
                    className="rounded-md border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-sm sm:col-span-4"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBoardForm(boardForm.filter((x) => x.id !== m.id))
                    }
                    className="flex items-center justify-center rounded-md border border-[#e6e5e0] bg-white p-1.5 text-red-600 hover:bg-red-50 sm:col-span-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-[#191919] px-6 py-3 text-sm font-medium text-white hover:bg-[#333333]"
          >
            Tüm Ayarları Kaydet
          </button>
        </form>
      )}

      {/* TAB 5: MESSAGES */}
      {tab === "messages" && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#191919]">
              İletişim Formundan Gelen Mesajlar
            </h2>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setMsgFilter("all")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  msgFilter === "all"
                    ? "bg-[#191919] text-white"
                    : "border border-[#e6e5e0] bg-white text-[#666560]"
                }`}
              >
                Tümü ({data.contact_messages.length})
              </button>
              <button
                type="button"
                onClick={() => setMsgFilter("unread")}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  msgFilter === "unread"
                    ? "bg-[#191919] text-white"
                    : "border border-[#e6e5e0] bg-white text-[#666560]"
                }`}
              >
                Okunmamış ({unreadCount})
              </button>
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-8 text-center text-sm text-[#666560]">
              Bu görünümde mesaj bulunmamaktadır.
            </div>
          ) : (
            filteredMessages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-5 ${
                  m.is_read
                    ? "border-[#e6e5e0] bg-white"
                    : "border-[#191919] bg-[#fbfbfa]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#191919]">
                        {m.sender_name}
                      </span>
                      {m.sender_phone && (
                        <a
                          href={`tel:${m.sender_phone}`}
                          className="inline-flex items-center gap-1 rounded bg-[#f4f3ef] px-2 py-0.5 text-xs font-medium text-[#191919] hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {m.sender_phone}
                        </a>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-[#666560]">
                      Konu: {m.subject} • {formatDateTR(m.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!m.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(m.id)}
                        className="rounded-md border border-[#e6e5e0] bg-white px-2.5 py-1 text-xs font-medium hover:bg-[#f4f3ef]"
                      >
                        Okundu İşaretle
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(m.id)}
                      className="rounded-md border border-[#e6e5e0] bg-white p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#191919]">
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
