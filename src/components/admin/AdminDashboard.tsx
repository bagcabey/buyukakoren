"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  HeartHandshake,
  Image as ImageIcon,
  Images,
  LayoutTemplate,
  LogOut,
  Mail,
  Navigation,
  Phone,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
} from "lucide-react";
import { formatDateTR, getCategoryLabel } from "@/lib/format";
import {
  AdminRole,
  BoardMember,
  Condolence,
  ContactMessage,
  GalleryPhoto,
  PageConfig,
  Post,
  PostCategory,
  ProjectStatus,
  PublishStatus,
  SiteSettings,
  StoreData,
} from "@/lib/types";
import { BatchGalleryUploader } from "./BatchGalleryUploader";
import { GalleryImagePickerModal } from "./GalleryImagePickerModal";
import { MarkdownPostEditor } from "./MarkdownPostEditor";
import { MenuFooterTab } from "./MenuFooterTab";
import { PageDesignerTab } from "./PageDesignerTab";
import { UsersAuditTab } from "./UsersAuditTab";

type TabKey =
  | "posts"
  | "condolences"
  | "gallery"
  | "pages"
  | "menu"
  | "settings"
  | "messages"
  | "users";

const DEFAULT_POST_CATEGORIES = ["duyuru", "haber", "aciklama", "faaliyet"];
const DEFAULT_GALLERY_ALBUMS = [
  "Köyümüzden Kareler",
  "Dernek Faaliyetleri",
  "Eğitim & Kültür",
];

const BOARD_ROLE_PRESETS = [
  "Başkan",
  "Başkan Yardımcısı",
  "Sayman",
  "Genel Sekreter",
  "Asil Üye",
  "Yedek Üye",
  "Denetim Kurulu Başkanı",
  "Denetim Kurulu Üyesi",
];

const PRAYER_TIME_PRESETS = [
  "Öğle Namazına Müteakip",
  "İkindi Namazına Müteakip",
  "Cuma Namazına Müteakip",
  "Sabah Namazına Müteakip",
  "Akşam Namazına Müteakip",
  "Yatsı Namazına Müteakip",
  "Saat Belirtilmeksizin",
];

const CONDOLENCE_MESSAGE_TEMPLATES = [
  {
    title: "Genel Taziye",
    text: "Köyümüz halkından merhuma/merhumeye Allah'tan rahmet, kederli ailesine ve tüm hemşehrilerimize başsağlığı dileriz. Mekânı cennet olsun.",
  },
  {
    title: "İnna Lillahi (Ayetli)",
    text: "İnna lillahi ve inna ileyhi raciun. Köyümüz sakinlerinden merhuma Cenab-ı Hak'tan rahmet, kederli ailesi ve sevenlerine sabr-ı cemil dileriz.",
  },
  {
    title: "Gurbet Taziyesi",
    text: "Gurbette yaşayan köylümüzün vefatını derin bir üzüntüyle öğrenmiş bulunmaktayız. Merhuma Allah'tan rahmet, ailesine ve köylülerimize başsağlığı dileriz.",
  },
  {
    title: "Köy Büyüğü",
    text: "Acı kaybımız. Köyümüzün değerli büyüğüne Allah'tan rahmet, tüm Büyük Akören halkına ve kederli akrabalarına başsağlığı dileriz.",
  },
];

function InlineCategoryCreator({
  value,
  onChange,
  onAdd,
  onCancel,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  placeholder: string;
}) {
  return (
    <div className="mt-2 flex gap-1.5">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#191919]"
      />
      <button
        type="button"
        onClick={onAdd}
        className="rounded-lg bg-[#191919] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#333333]"
      >
        Ekle
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs text-[#666560] hover:bg-[#f4f3ef]"
      >
        İptal
      </button>
    </div>
  );
}

function toDatetimeLocalValue(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function AdminDashboard({
  initialData,
  currentUser = {
    username: "admin",
    display_name: "Yönetici",
    role: "yonetici" as AdminRole,
  },
}: {
  initialData: StoreData;
  currentUser?: { username: string; display_name: string; role: AdminRole };
}) {
  const router = useRouter();
  const isManager = currentUser.role === "yonetici";
  const [data, setData] = useState<StoreData>(initialData);
  const [storeVersion, setStoreVersion] = useState<number>(
    initialData.version ?? 1
  );
  const [tab, setTab] = useState<TabKey>("posts");
  const [mobileFormOpen, setMobileFormOpen] = useState<{
    posts: boolean;
    condolences: boolean;
    gallery: boolean;
  }>({ posts: false, condolences: false, gallery: false });
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(
    null
  );
  const [refreshingMessages, setRefreshingMessages] = useState(false);

  function notify(msg: string, err = false) {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3200);
  }

  const refreshMessages = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshingMessages(true);
    try {
      const res = await fetch("/api/contact", { cache: "no-store" });
      if (!res.ok) return;
      const m = (await res.json()) as { messages?: ContactMessage[] };
      if (Array.isArray(m.messages)) {
        setData((prev) => ({
          ...prev,
          contact_messages: m.messages!,
        }));
      }
    } catch {
      // Sessiz arka plan yenileme hatasını yoksay
    } finally {
      if (showSpinner) setRefreshingMessages(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void refreshMessages();
    }, 10000);
    const handleFocus = () => {
      void refreshMessages();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshMessages();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshMessages]);

  async function refreshAll() {
    const [pRes, cRes, gRes, sRes, mRes, pgRes] = await Promise.all([
      fetch("/api/posts", { cache: "no-store" }),
      fetch("/api/condolences", { cache: "no-store" }),
      fetch("/api/gallery", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/contact", { cache: "no-store" }),
      fetch("/api/pages", { cache: "no-store" }),
    ]);
    const [p, c, g, s, m, pg] = await Promise.all([
      pRes.json(),
      cRes.json(),
      gRes.json(),
      sRes.json(),
      mRes.json(),
      pgRes.json(),
    ]);
    const nextVersion =
      typeof pg.version === "number"
        ? pg.version
        : typeof p.version === "number"
        ? p.version
        : storeVersion;
    setStoreVersion(nextVersion);
    setData({
      version: nextVersion,
      posts: p.posts || [],
      condolences: c.condolences || [],
      gallery_photos: g.gallery_photos || [],
      board_members: s.board_members || [],
      site_settings: s.site_settings || initialData.site_settings,
      contact_messages: m.messages || [],
      pages: pg.pages || data.pages || [],
    });
    if (s.site_settings) setSettingsForm(s.site_settings);
    if (Array.isArray(s.board_members)) setBoardForm(s.board_members);
    router.refresh();
  }

  function handleConflictOrError(res: Response, fallbackMsg: string, errJson?: { error?: string }) {
    if (res.status === 409) {
      notify(
        "Veri başka bir oturumda güncellenmiş (sürüm çakışması). Son veriler yenileniyor...",
        true
      );
      void refreshAll();
      return;
    }
    notify(errJson?.error || fallbackMsg, true);
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
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);
  const [postCategory, setPostCategory] = useState<PostCategory>("duyuru");
  const [addingPostCat, setAddingPostCat] = useState(false);
  const [newPostCatInput, setNewPostCatInput] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postSummary, setPostSummary] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postImageAlt, setPostImageAlt] = useState("");
  const [postImgAuthor, setPostImgAuthor] = useState("");
  const [postImgLicense, setPostImgLicense] = useState("");
  const [postImgSource, setPostImgSource] = useState("");
  const [postAttachment, setPostAttachment] = useState("");
  const [postStatus, setPostStatus] = useState<ProjectStatus | "">("");
  const [postPinned, setPostPinned] = useState(false);
  const [postPublished, setPostPublished] = useState(true);
  const [postPublishStatus, setPostPublishStatus] = useState<PublishStatus>("published");
  const [postPublishedAt, setPostPublishedAt] = useState("");
  const [postSeoTitle, setPostSeoTitle] = useState("");
  const [postSeoDesc, setPostSeoDesc] = useState("");

  function appendPostMarkdown(snippet: string) {
    setPostContent((prev) =>
      prev.trim().length > 0 ? `${prev.replace(/\n+$/, "")}\n\n${snippet}` : snippet
    );
  }

  function loadPostForEdit(p: Post) {
    setEditingId(p.id);
    setPostCategory(p.category);
    setPostTitle(p.title);
    setPostSummary(p.summary);
    setPostContent(p.content);
    setPostImage(p.image_url || "");
    setPostImageAlt(p.image_alt || "");
    setPostImgAuthor(p.image_attribution?.author || "");
    setPostImgLicense(p.image_attribution?.license || "");
    setPostImgSource(p.image_attribution?.source_url || "");
    setPostAttachment(p.attachment_url || "");
    setPostStatus(p.project_status || "");
    setPostPinned(p.is_pinned);
    setPostPublished(p.is_published);
    setPostPublishStatus(p.status || (p.is_published ? "published" : "draft"));
    setPostPublishedAt(toDatetimeLocalValue(p.published_at));
    setPostSeoTitle(p.seo_title || "");
    setPostSeoDesc(p.seo_description || "");
    setMobileFormOpen((prev) => ({ ...prev, posts: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetPostForm() {
    setEditingId(undefined);
    const activeCat =
      postFilter !== "tumu" && postFilter !== "taslak" ? postFilter : "duyuru";
    setPostCategory(activeCat);
    setPostTitle("");
    setPostSummary("");
    setPostContent("");
    setPostImage("");
    setPostImageAlt("");
    setPostImgAuthor("");
    setPostImgLicense("");
    setPostImgSource("");
    setPostAttachment("");
    setPostStatus("");
    setPostPinned(false);
    setPostPublished(true);
    setPostPublishStatus("published");
    setPostPublishedAt("");
    setPostSeoTitle("");
    setPostSeoDesc("");
  }

  async function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    const effectivePublished =
      postPublishStatus === "published" && postPublished;
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
        image_alt: postImageAlt || null,
        image_attribution:
          postImgAuthor || postImgLicense || postImgSource
            ? {
                author: postImgAuthor || undefined,
                license: postImgLicense || undefined,
                source_url: postImgSource || undefined,
              }
            : null,
        attachment_url: postAttachment || null,
        project_status:
          postCategory === "faaliyet" && postStatus ? postStatus : null,
        is_pinned: postPinned,
        is_published: effectivePublished,
        status: effectivePublished
          ? "published"
          : postPublishStatus === "archived"
          ? "archived"
          : "draft",
        published_at: postPublishedAt
          ? new Date(postPublishedAt).toISOString()
          : undefined,
        seo_title: postSeoTitle || null,
        seo_description: postSeoDesc || null,
        expected_version: storeVersion,
      }),
    });
    if (res.ok) {
      resetPostForm();
      await refreshAll();
      notify("İçerik kaydedildi.");
    } else {
      const errJson = (await res.json().catch(() => ({}))) as { error?: string };
      handleConflictOrError(res, "Kayıt sırasında hata oluştu.", errJson);
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
        expected_version: storeVersion,
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
    } else {
      const errJson = (await res.json().catch(() => ({}))) as { error?: string };
      handleConflictOrError(res, "Güncelleme başarısız.", errJson);
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
  const [condDate, setCondDate] = useState("");
  const [condPrayerTime, setCondPrayerTime] = useState("Öğle Namazına Müteakip");
  const [condPhotoUrl, setCondPhotoUrl] = useState("");
  const [burialPlace, setBurialPlace] = useState("Büyük Akören Köyü Mezarlığı");
  const [condMessage, setCondMessage] = useState(
    "Merhuma/Merhumeye Allah'tan rahmet, kederli ailesine ve tüm hemşehrilerimize başsağlığı dileriz."
  );
  const [relatives, setRelatives] = useState("");
  const [condPublished, setCondPublished] = useState(true);
  const [familyConsentConfirmed, setFamilyConsentConfirmed] = useState(true);

  function applyStructuredFuneralDate(dateStr: string, prayerStr: string) {
    if (!dateStr) return;
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
      ];
      const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
      const formatted = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${days[d.getDay()]}, ${prayerStr}`;
      setFuneralDate(formatted);
    } catch {
      setFuneralDate(`${dateStr}, ${prayerStr}`);
    }
  }

  function loadCondForEdit(c: Condolence) {
    setEditingCondId(c.id);
    setDeceasedName(c.deceased_name);
    setAgeOrNote(c.age_or_note || "");
    setFuneralDate(c.funeral_date);
    setBurialPlace(c.burial_place);
    setCondMessage(c.message);
    setRelatives(c.relatives || "");
    setCondPhotoUrl(c.image_url || "");
    setCondPublished(c.is_published);
    setFamilyConsentConfirmed(c.family_consent_confirmed !== false);
    setMobileFormOpen((prev) => ({ ...prev, condolences: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetCondForm() {
    setEditingCondId(undefined);
    setDeceasedName("");
    setAgeOrNote("");
    setFuneralDate("");
    setCondDate("");
    setCondPrayerTime("Öğle Namazına Müteakip");
    setCondPhotoUrl("");
    setBurialPlace("Büyük Akören Köyü Mezarlığı");
    setCondMessage(
      "Merhuma/Merhumeye Allah'tan rahmet, kederli ailesine ve tüm hemşehrilerimize başsağlığı dileriz."
    );
    setRelatives("");
    setCondPublished(true);
    setFamilyConsentConfirmed(true);
  }

  async function handleSaveCondolence(e: React.FormEvent) {
    e.preventDefault();
    if (condPublished && !familyConsentConfirmed) {
      notify("Taziye ilanı yayınlamak için yakınların rızası onaylanmalıdır.", true);
      return;
    }
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
        image_url: condPhotoUrl || null,
        is_published: condPublished,
        family_consent_confirmed: familyConsentConfirmed,
        expected_version: storeVersion,
      }),
    });
    if (res.ok) {
      resetCondForm();
      await refreshAll();
      notify("Taziye ilanı kaydedildi.");
    } else {
      const errJson = (await res.json().catch(() => ({}))) as { error?: string };
      handleConflictOrError(res, "Taziye ilanı kaydedilemedi.", errJson);
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
  const [addingGalAlbum, setAddingGalAlbum] = useState(false);
  const [newGalAlbumInput, setNewGalAlbumInput] = useState("");
  const [galUrl, setGalUrl] = useState("");
  const [galAlt, setGalAlt] = useState("");
  const [galYear, setGalYear] = useState("2026");
  const [galAuthor, setGalAuthor] = useState("");
  const [galLicense, setGalLicense] = useState("");
  const [galSourceUrl, setGalSourceUrl] = useState("");

  const postCategories = Array.from(
    new Set([
      ...DEFAULT_POST_CATEGORIES,
      ...(data.site_settings.custom_post_categories || []),
      ...data.posts.map((p) => p.category).filter(Boolean),
    ])
  );

  const galleryAlbums = Array.from(
    new Set([
      ...DEFAULT_GALLERY_ALBUMS,
      ...(data.site_settings.custom_gallery_albums || []),
      ...data.gallery_photos.map((g) => g.album).filter(Boolean),
    ])
  );

  async function handleAddCustomCategory(kind: "post" | "gallery") {
    const raw = kind === "post" ? newPostCatInput : newGalAlbumInput;
    const trimmed = raw.trim();
    if (!trimmed) return;

    const field =
      kind === "post" ? "custom_post_categories" : "custom_gallery_albums";
    const existingList = kind === "post" ? postCategories : galleryAlbums;

    const matched = existingList.find(
      (c) =>
        c.toLocaleLowerCase("tr-TR") === trimmed.toLocaleLowerCase("tr-TR") ||
        getCategoryLabel(c).toLocaleLowerCase("tr-TR") ===
          trimmed.toLocaleLowerCase("tr-TR")
    );
    const targetValue = matched || trimmed;

    if (!matched) {
      const currentCustom = data.site_settings[field] || [];
      const nextSettings: SiteSettings = {
        ...data.site_settings,
        [field]: [...currentCustom, targetValue],
      };
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_settings: nextSettings }),
      });
      if (!res.ok) {
        notify("Kategori eklenemedi.", true);
        return;
      }
      setSettingsForm((prev) => ({
        ...prev,
        [field]: nextSettings[field],
      }));
      await refreshAll();
      notify(
        kind === "post"
          ? `"${targetValue}" kategorisi eklendi.`
          : `"${targetValue}" albüm kategorisi eklendi.`
      );
    }

    if (kind === "post") {
      setPostCategory(targetValue);
      setPostFilter(targetValue);
      setNewPostCatInput("");
      setAddingPostCat(false);
    } else {
      setGalAlbum(targetValue);
      setGalFilter(targetValue);
      setNewGalAlbumInput("");
      setAddingGalAlbum(false);
    }
  }

  function loadGalForEdit(g: GalleryPhoto) {
    setEditingGalId(g.id);
    setGalTitle(g.title);
    setGalAlbum(g.album);
    setGalUrl(g.image_url);
    setGalAlt(g.image_alt || "");
    setGalYear(g.taken_year || "");
    setGalAuthor(g.attribution_author || "");
    setGalLicense(g.attribution_license || "");
    setGalSourceUrl(g.source_url || "");
    setMobileFormOpen((prev) => ({ ...prev, gallery: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetGalForm() {
    setEditingGalId(undefined);
    setGalTitle("");
    setGalAlbum(galFilter !== "Tümü" ? galFilter : "Köyümüzden Kareler");
    setGalUrl("");
    setGalAlt("");
    setGalYear("2026");
    setGalAuthor("");
    setGalLicense("");
    setGalSourceUrl("");
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
        image_alt: galAlt,
        taken_year: galYear,
        attribution_author: galAuthor,
        attribution_license: galLicense,
        source_url: galSourceUrl,
        expected_version: storeVersion,
      }),
    });
    if (res.ok) {
      resetGalForm();
      await refreshAll();
      notify("Galeri fotoğrafı kaydedildi.");
    } else {
      const errJson = (await res.json().catch(() => ({}))) as { error?: string };
      handleConflictOrError(res, "Galeri fotoğrafı kaydedilemedi.", errJson);
    }
  }

  async function handleDeleteGallery(id: string) {
    if (!confirm("Bu fotoğrafı galeriden kaldırmak istediğinize emin misiniz?"))
      return;
    await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    await refreshAll();
    notify("Fotoğraf kaldırıldı.");
  }

  const albums = ["Tümü", ...galleryAlbums];
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

  async function handleSaveSettings(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
        expected_version: storeVersion,
      }),
    });
    if (res.ok) {
      await refreshAll();
      notify("Site ayarları ve yönetim kurulu güncellendi.");
    } else {
      const errJson = (await res.json().catch(() => ({}))) as { error?: string };
      handleConflictOrError(res, "Ayarlar kaydedilemedi.", errJson);
    }
  }

  function addBoardMember() {
    setBoardForm((prev) => [
      ...prev,
      {
        id: `bm-${Date.now()}`,
        full_name: "",
        role: "Asil Üye",
        bio: "",
        photo_url: "",
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

  const missingChecklist: string[] = [];
  if (
    !data.site_settings.iban_number?.trim() ||
    /^TR00/i.test(data.site_settings.iban_number.replace(/\s+/g, ""))
  ) {
    missingChecklist.push("Resmî IBAN numarası");
  }
  if (
    !data.site_settings.iban_bank?.trim() ||
    data.site_settings.iban_bank.toLowerCase().includes("panelden")
  ) {
    missingChecklist.push("Banka adı");
  }
  if (
    !data.site_settings.association_email?.trim() ||
    data.site_settings.association_email.includes("buyukakoren.org")
  ) {
    missingChecklist.push("Resmî dernek e-postası");
  }
  if (!data.site_settings.mukhtar_phone?.trim()) {
    missingChecklist.push("Muhtarlık telefonu");
  }
  const hasRealBoard = (data.board_members || []).some(
    (m) => m.full_name?.trim() && !m.full_name.toLowerCase().includes("panelden")
  );
  if (!hasRealBoard) {
    missingChecklist.push("Yönetim kurulu üyeleri");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e6e5e0] pb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
            B.Akören Yönetim • {currentUser.display_name} ({isManager ? "Tam Yönetici" : "Editör"})
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
          onClick={() => {
            setTab("messages");
            void refreshMessages();
          }}
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

      {isManager && missingChecklist.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold">
                Teslim Öncesi Eksik Kurumsal Bilgiler ({missingChecklist.length})
              </p>
              <p className="mt-0.5 text-amber-800">
                Şu alanlar henüz tanımlanmadığı için ziyaretçi sayfalarında gizlenir:{" "}
                {missingChecklist.join(", ")}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTab("settings")}
            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            Bilgileri Tamamla →
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mt-6 border-b border-[#e6e5e0] pb-3">
        {/* Mobile touch indicator and active tab hint */}
        <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-[#666560] sm:hidden">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-[#191919]" />
            Yönetim Sekmeleri ({isManager ? 8 : 6})
          </span>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-[#8c8b85]">
            Yana kaydırın <ChevronRight className="inline h-3 w-3" />
          </span>
        </div>

        {/* Scrollable Tabs Container */}
        <div className="relative">
          <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto scroll-smooth overscroll-x-contain py-1 sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              onClick={() => setTab("posts")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                tab === "posts"
                  ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                  : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Duyuru, Haber & Faaliyet ({data.posts.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("condolences")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                tab === "condolences"
                  ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                  : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
              }`}
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              Taziye İlanları ({data.condolences.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("gallery")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                tab === "gallery"
                  ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                  : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
              }`}
            >
              <Images className="h-3.5 w-3.5" />
              Galeri ({data.gallery_photos.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("pages")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                tab === "pages"
                  ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                  : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
              }`}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Sayfa Tasarımcısı ({(data.pages || []).length})
            </button>
            {isManager && (
              <button
                type="button"
                onClick={() => setTab("menu")}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                  tab === "menu"
                    ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                    : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                Menü & Alt Bilgi
              </button>
            )}
            {isManager && (
              <button
                type="button"
                onClick={() => setTab("settings")}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                  tab === "settings"
                    ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                    : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Ayarlar & Yönetim
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setTab("messages");
                void refreshMessages();
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                tab === "messages"
                  ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                  : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Gelen Mesajlar {unreadCount > 0 ? `(${unreadCount} yeni)` : ""}
            </button>
            <button
              type="button"
              onClick={() => setTab("users")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                tab === "users"
                  ? "bg-[#191919] text-white shadow-sm ring-1 ring-[#191919]"
                  : "border border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:border-[#d0cfc9] hover:text-[#191919]"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              {isManager ? "Kullanıcılar & Kayıtlar" : "Hesabım"}
            </button>
          </div>
          {/* Subtle right-edge fade indicator on mobile to cue scrollable overflow */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent sm:hidden" />
        </div>
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
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-medium text-[#191919]">
                    Tür / Kategori
                  </label>
                  <button
                    type="button"
                    onClick={() => setAddingPostCat((v) => !v)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1f4d36] hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Yeni Kategori
                  </button>
                </div>
                <select
                  value={postCategory}
                  onChange={(e) => {
                    if (e.target.value === "__new__") {
                      setAddingPostCat(true);
                    } else {
                      setPostCategory(e.target.value as PostCategory);
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                >
                  {postCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                  <option value="__new__">+ Yeni Kategori Ekle...</option>
                </select>
                {addingPostCat && (
                  <InlineCategoryCreator
                    value={newPostCatInput}
                    onChange={setNewPostCatInput}
                    onAdd={() => handleAddCustomCategory("post")}
                    onCancel={() => {
                      setAddingPostCat(false);
                      setNewPostCatInput("");
                    }}
                    placeholder="Yeni kategori adı..."
                  />
                )}
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
              <label className="mb-1 block text-xs font-medium text-[#191919]">
                Detaylı İçerik *
              </label>
              <MarkdownPostEditor
                value={postContent}
                onChange={setPostContent}
                rows={8}
                required
                placeholder="Haberin veya açıklamanın tam metnini giriniz..."
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
                  placeholder="/images/katalog/01-koy-ve-cevre/01_yildizeli_koy_manzarasi.webp"
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
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2 text-xs font-semibold text-[#191919] hover:bg-[#f4f3ef] hover:border-[#191919] transition"
                >
                  <Images className="h-4 w-4 text-[#191919]" />
                  Görsel Galerisinden Seç ({data.gallery_photos.length} Fotoğraf)
                </button>
                {postImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setPostImage("");
                      setPostImageAlt("");
                      setPostImgAuthor("");
                      setPostImgLicense("");
                      setPostImgSource("");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-medium text-red-700 hover:bg-red-100 transition"
                  >
                    Görseli Kaldır
                  </button>
                )}
              </div>
              <GalleryImagePickerModal
                isOpen={isGalleryPickerOpen}
                onClose={() => setIsGalleryPickerOpen(false)}
                onSelect={(photo) => {
                  setPostImage(photo.image_url);
                  if (!postImageAlt && (photo.image_alt || photo.title)) {
                    setPostImageAlt(photo.image_alt || photo.title);
                  }
                  if (photo.attribution_author) setPostImgAuthor(photo.attribution_author);
                  if (photo.attribution_license) setPostImgLicense(photo.attribution_license);
                  if (photo.source_url) setPostImgSource(photo.source_url);
                  notify(`"${photo.title}" görseli seçildi.`);
                }}
                photos={data.gallery_photos}
                selectedImageUrl={postImage}
              />
              {postImage && (
                <div className="mt-2 space-y-2">
                  <div className="overflow-hidden rounded-lg border border-[#e6e5e0] bg-white p-1">
                    <img
                      src={postImage}
                      alt={postImageAlt || "Önizleme"}
                      className="h-28 w-full rounded object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Görsel açıklaması (isteğe bağlı)"
                    value={postImageAlt}
                    onChange={(e) => setPostImageAlt(e.target.value)}
                    className="w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs"
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Yayın Durumu
                </label>
                <select
                  value={postPublishStatus}
                  onChange={(e) => {
                    const val = e.target.value as PublishStatus;
                    setPostPublishStatus(val);
                    setPostPublished(val === "published");
                  }}
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
                >
                  <option value="published">Yayında</option>
                  <option value="draft">Taslak</option>
                  <option value="archived">Arşiv</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#191919]">
                  Yayın Tarihi (İleri tarihli planlama)
                </label>
                <input
                  type="datetime-local"
                  value={postPublishedAt}
                  onChange={(e) => setPostPublishedAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs"
                />
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
                  onChange={(e) => {
                    const chk = e.target.checked;
                    setPostPublished(chk);
                    setPostPublishStatus(chk ? "published" : "draft");
                  }}
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
                  ...postCategories.map((c) => ({
                    k: c,
                    l: getCategoryLabel(c),
                  })),
                  { k: "taslak", l: "Taslaklar" },
                ].map((f) => (
                  <button
                    key={f.k}
                    type="button"
                    onClick={() => {
                      setPostFilter(f.k);
                      if (!editingId && f.k !== "tumu" && f.k !== "taslak") {
                        setPostCategory(f.k);
                      }
                    }}
                    className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                      postFilter === f.k
                        ? "bg-[#191919] text-white"
                        : "border border-[#e6e5e0] bg-white text-[#666560] hover:text-[#191919]"
                    }`}
                  >
                    {f.l}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAddingPostCat((v) => !v)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-[#cfcec8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1f4d36] hover:border-[#1f4d36] hover:bg-[#f4f7f5]"
                >
                  <Plus className="h-3 w-3" />
                  Yeni Kategori
                </button>
              </div>
              {addingPostCat && (
                <InlineCategoryCreator
                  value={newPostCatInput}
                  onChange={setNewPostCatInput}
                  onAdd={() => handleAddCustomCategory("post")}
                  onCancel={() => {
                    setAddingPostCat(false);
                    setNewPostCatInput("");
                  }}
                  placeholder="Yeni kategori adı yazın..."
                />
              )}
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
                        {getCategoryLabel(p.category)}
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
                placeholder="Örn. Büyükakören Köyü sakinlerinden"
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#191919]">
                Merhum / Merhume Fotoğrafı (Opsiyonel)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={condPhotoUrl}
                  onChange={(e) => setCondPhotoUrl(e.target.value)}
                  placeholder="Görsel bağlantısı veya yükle..."
                  className="flex-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
                />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]">
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
                        if (url) setCondPhotoUrl(url);
                      }
                    }}
                  />
                </label>
              </div>
              {condPhotoUrl && (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-[#e6e5e0] bg-white p-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={condPhotoUrl}
                      alt={deceasedName || "Merhum Fotoğrafı"}
                      className="h-12 w-12 rounded-lg object-cover border border-[#e6e5e0]"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#191919]">
                        {deceasedName || "Merhum / Merhume Fotoğrafı"}
                      </p>
                      <p className="text-[11px] text-[#666560]">Fotoğraf ilana eklendi</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCondPhotoUrl("")}
                    className="rounded p-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Kaldır
                  </button>
                </div>
              )}
            </div>

            {/* Structured Funeral Date & Prayer Time Selector */}
            <div className="space-y-2.5 rounded-xl border border-[#e6e5e0] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#191919]">
                  <Clock className="h-3.5 w-3.5 text-[#191919]" />
                  Cenaze Tarihi ve Vakti (Yapılandırılmış) *
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split("T")[0];
                      setCondDate(today);
                      applyStructuredFuneralDate(today, condPrayerTime);
                    }}
                    className="rounded border border-[#e6e5e0] bg-[#fbfbfa] px-2 py-0.5 text-[10px] font-medium text-[#191919] hover:bg-[#f4f3ef]"
                  >
                    Bugün
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tomorrow = new Date(Date.now() + 86400000)
                        .toISOString()
                        .split("T")[0];
                      setCondDate(tomorrow);
                      applyStructuredFuneralDate(tomorrow, condPrayerTime);
                    }}
                    className="rounded border border-[#e6e5e0] bg-[#fbfbfa] px-2 py-0.5 text-[10px] font-medium text-[#191919] hover:bg-[#f4f3ef]"
                  >
                    Yarın
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <span className="block text-[11px] font-medium text-[#666560]">
                    Tarih Seçici
                  </span>
                  <input
                    type="date"
                    value={condDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCondDate(val);
                      applyStructuredFuneralDate(val, condPrayerTime);
                    }}
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs text-[#191919]"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-[#666560]">
                    Namaz Vakti Seçici
                  </span>
                  <select
                    value={condPrayerTime}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCondPrayerTime(val);
                      applyStructuredFuneralDate(condDate, val);
                    }}
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1.5 text-xs text-[#191919]"
                  >
                    {PRAYER_TIME_PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-[#666560]">
                  İlanda Görünecek Metin (İsteğe bağlı serbest düzenleme)
                </span>
                <input
                  type="text"
                  required
                  value={funeralDate}
                  onChange={(e) => setFuneralDate(e.target.value)}
                  placeholder="Örn. 14 Kasım, Öğle namazına müteakip"
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs"
                />
              </div>
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

            {/* Condolence Message & Templates */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label className="block text-xs font-medium text-[#191919]">
                  Taziye Mesajı
                </label>
                <span className="text-[11px] text-[#666560]">
                  Hazır Şablonlar:
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {CONDOLENCE_MESSAGE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.title}
                    type="button"
                    onClick={() => setCondMessage(tmpl.text)}
                    className="rounded-md border border-[#e6e5e0] bg-white px-2 py-0.5 text-[11px] font-medium text-[#191919] hover:bg-[#f4f3ef] transition"
                    title={tmpl.text}
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={condMessage}
                onChange={(e) => setCondMessage(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
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
            <div className="space-y-2">
              <label className="flex items-start gap-2 text-xs font-medium text-[#191919]">
                <input
                  type="checkbox"
                  required={condPublished}
                  checked={familyConsentConfirmed}
                  onChange={(e) => setFamilyConsentConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#e6e5e0]"
                />
                <span>Merhum/merhume yakınlarının açık rızası alındı (Zorunlu)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-[#191919]">
                <input
                  type="checkbox"
                  checked={condPublished}
                  onChange={(e) => setCondPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-[#e6e5e0]"
                />
                Sitede yayında göster
              </label>
            </div>
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
                <div className="flex items-start gap-3">
                  {c.image_url && (
                    <img
                      src={c.image_url}
                      alt={c.deceased_name}
                      className="h-11 w-11 shrink-0 rounded-lg object-cover border border-[#e6e5e0]"
                    />
                  )}
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
          <div className="space-y-4 lg:col-span-4">
            {/* Multi-file Batch Upload Component */}
            <BatchGalleryUploader
              album={galAlbum}
              year={galYear}
              author={galAuthor}
              license={galLicense}
              expectedVersion={storeVersion}
              onUploadComplete={refreshAll}
              notify={notify}
            />

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
                  : "Tekil Fotoğraf Ekle / Düzenle"}
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
                {editingGalId ? "Fotoğrafı Düzenle" : "Tekil Fotoğraf Ekle / Düzenle"}
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
              <div className="flex items-center justify-between gap-2">
                <label className="block text-xs font-medium text-[#191919]">
                  Albüm / Kategori
                </label>
                <button
                  type="button"
                  onClick={() => setAddingGalAlbum((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1f4d36] hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Yeni Kategori
                </button>
              </div>
              <select
                value={galAlbum}
                onChange={(e) => {
                  if (e.target.value === "__new__") {
                    setAddingGalAlbum(true);
                  } else {
                    setGalAlbum(e.target.value);
                  }
                }}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
              >
                {galleryAlbums.map((alb) => (
                  <option key={alb} value={alb}>
                    {alb}
                  </option>
                ))}
                <option value="__new__">+ Yeni Kategori / Albüm Ekle...</option>
              </select>
              {addingGalAlbum && (
                <InlineCategoryCreator
                  value={newGalAlbumInput}
                  onChange={setNewGalAlbumInput}
                  onAdd={() => handleAddCustomCategory("gallery")}
                  onCancel={() => {
                    setAddingGalAlbum(false);
                    setNewGalAlbumInput("");
                  }}
                  placeholder="Yeni albüm / kategori adı..."
                />
              )}
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
                    alt={galAlt || "Önizleme"}
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
            <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-3">
              <div className="no-scrollbar flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {albums.map((alb) => (
                  <button
                    key={alb}
                    type="button"
                    onClick={() => {
                      setGalFilter(alb);
                      if (!editingGalId && alb !== "Tümü") {
                        setGalAlbum(alb);
                      }
                    }}
                    className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium ${
                      galFilter === alb
                        ? "bg-[#191919] text-white"
                        : "border border-[#e6e5e0] bg-white text-[#666560] hover:text-[#191919]"
                    }`}
                  >
                    {alb}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAddingGalAlbum((v) => !v)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-[#cfcec8] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1f4d36] hover:border-[#1f4d36] hover:bg-[#f4f7f5]"
                >
                  <Plus className="h-3 w-3" />
                  Yeni Kategori
                </button>
              </div>
              {addingGalAlbum && (
                <InlineCategoryCreator
                  value={newGalAlbumInput}
                  onChange={setNewGalAlbumInput}
                  onAdd={() => handleAddCustomCategory("gallery")}
                  onCancel={() => {
                    setAddingGalAlbum(false);
                    setNewGalAlbumInput("");
                  }}
                  placeholder="Yeni albüm / kategori adı yazın..."
                />
              )}
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

      {/* TAB: PAGE DESIGNER */}
      {tab === "pages" && (
        <PageDesignerTab
          pages={data.pages || []}
          galleryPhotos={data.gallery_photos}
          storeVersion={storeVersion}
          onPagesUpdated={(nextPages, nextVer) => {
            setData((prev) => ({ ...prev, pages: nextPages }));
            if (typeof nextVer === "number") setStoreVersion(nextVer);
            router.refresh();
          }}
          notify={notify}
          uploadFile={uploadFile}
        />
      )}

      {/* TAB: MENU & FOOTER */}
      {isManager && tab === "menu" && (
        <MenuFooterTab
          settings={settingsForm}
          setSettings={setSettingsForm}
          onSave={handleSaveSettings}
        />
      )}

      {/* TAB 4: SETTINGS & BOARD */}
      {isManager && tab === "settings" && (
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
                  Köy Muhtarı Adı Soyadı (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={settingsForm.mukhtar_name || ""}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      mukhtar_name: e.target.value,
                    })
                  }
                  placeholder="Boş bırakılabilir"
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
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
                  placeholder="İstenirse muhtarlık telefonu eklenebilir"
                  className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-[#191919]">
                    Kuruluş Yılı
                  </label>
                  <input
                    type="text"
                    value={settingsForm.founded_year || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        founded_year: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#191919]">
                    Dernek Kütük No
                  </label>
                  <input
                    type="text"
                    value={settingsForm.association_registry_no || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        association_registry_no: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#191919]">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tax_office || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        tax_office: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-2 text-xs"
                  />
                </div>
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
            <div className="mt-4 space-y-4">
              {boardForm.map((m, idx) => {
                const isCustomRole =
                  m.role &&
                  !BOARD_ROLE_PRESETS.includes(m.role) &&
                  m.role !== "__custom__";

                return (
                  <div
                    key={m.id}
                    className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 transition-all hover:border-[#cfcec8]"
                  >
                    {/* Header Row: Position badge & Order / Delete Controls */}
                    <div className="flex items-center justify-between border-b border-[#e6e5e0]/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#191919] font-mono text-xs font-bold text-white">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-[#191919]">
                          {m.full_name || "İsimsiz Üye"}{" "}
                          <span className="text-[11px] font-normal text-[#666560]">
                            ({m.role || "Görev Belirtilmedi"})
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveBoardMember(idx, -1)}
                          className="rounded border border-[#e6e5e0] bg-white p-1 text-[#666560] hover:text-[#191919] disabled:opacity-30"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === boardForm.length - 1}
                          onClick={() => moveBoardMember(idx, 1)}
                          className="rounded border border-[#e6e5e0] bg-white p-1 text-[#666560] hover:text-[#191919] disabled:opacity-30"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setBoardForm(boardForm.filter((x) => x.id !== m.id))
                          }
                          className="rounded border border-[#e6e5e0] bg-white p-1 text-red-600 hover:bg-red-50"
                          title="Üyeyi Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Member Details: Avatar + Inputs Grid */}
                    <div className="mt-3.5 grid gap-4 sm:grid-cols-12 sm:items-start">
                      {/* Avatar Photo Section */}
                      <div className="flex flex-col items-center gap-2 sm:col-span-3">
                        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#e6e5e0] bg-white shadow-xs">
                          {m.photo_url ? (
                            <img
                              src={m.photo_url}
                              alt={m.full_name || "Üye"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-10 w-10 text-[#a8a7a0]" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#e6e5e0] bg-white px-2 py-1 text-[11px] font-medium text-[#191919] hover:bg-[#f4f3ef]">
                            <Camera className="h-3 w-3" />
                            Fotoğraf
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const url = await uploadFile(f);
                                  if (url) {
                                    const next = [...boardForm];
                                    next[idx] = { ...m, photo_url: url };
                                    setBoardForm(next);
                                  }
                                }
                              }}
                            />
                          </label>
                          {m.photo_url && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...boardForm];
                                next[idx] = { ...m, photo_url: "" };
                                setBoardForm(next);
                              }}
                              className="rounded-md border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100"
                              title="Fotoğrafı Kaldır"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Member Form Inputs */}
                      <div className="space-y-3 sm:col-span-9">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-medium text-[#666560]">
                              Adı Soyadı *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Örn. Mustafa Tanju Çetiner"
                              value={m.full_name}
                              onChange={(e) => {
                                const next = [...boardForm];
                                next[idx] = { ...m, full_name: e.target.value };
                                setBoardForm(next);
                              }}
                              className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs text-[#191919] focus:border-[#191919] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#666560]">
                              Görevi / Ünvanı *
                            </label>
                            <select
                              value={
                                BOARD_ROLE_PRESETS.includes(m.role)
                                  ? m.role
                                  : "__custom__"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                const next = [...boardForm];
                                if (val === "__custom__") {
                                  next[idx] = {
                                    ...m,
                                    role: isCustomRole ? m.role : "",
                                  };
                                } else {
                                  next[idx] = { ...m, role: val };
                                }
                                setBoardForm(next);
                              }}
                              className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs text-[#191919] focus:border-[#191919] focus:outline-none"
                            >
                              {BOARD_ROLE_PRESETS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                              <option value="__custom__">
                                Diğer / Özel Görev...
                              </option>
                            </select>
                            {(!BOARD_ROLE_PRESETS.includes(m.role) ||
                              m.role === "") && (
                              <input
                                type="text"
                                placeholder="Özel Görev Adı (örn. Köy Temsilcisi)"
                                value={m.role}
                                onChange={(e) => {
                                  const next = [...boardForm];
                                  next[idx] = { ...m, role: e.target.value };
                                  setBoardForm(next);
                                }}
                                className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-1 text-xs"
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#666560]">
                            Kısa Biyografi / Meslek / Sorumluluk Alanı
                          </label>
                          <input
                            type="text"
                            placeholder="Örn. Emekli Eğitimci, Dernek Kurucu Başkanı"
                            value={m.bio || ""}
                            onChange={(e) => {
                              const next = [...boardForm];
                              next[idx] = { ...m, bio: e.target.value };
                              setBoardForm(next);
                            }}
                            className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-1.5 text-xs text-[#191919] focus:border-[#191919] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <button
                type="button"
                onClick={() => void refreshMessages(true)}
                disabled={refreshingMessages}
                className="inline-flex items-center gap-1 rounded-md border border-[#e6e5e0] bg-white px-3 py-1 text-xs font-medium text-[#191919] transition-colors hover:bg-[#f4f3ef] disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3 w-3 ${refreshingMessages ? "animate-spin" : ""}`}
                />
                Yenile
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

      {/* TAB: USERS & AUDIT LOGS */}
      {tab === "users" && (
        <UsersAuditTab currentUser={currentUser} notify={notify} />
      )}
    </div>
  );
}
