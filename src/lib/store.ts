import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  decryptServerData,
  encryptServerData,
  isEncryptedPayload,
  isEncryptionConfigured,
} from "./crypto";
import {
  deleteMessageRow,
  isDbConfigured,
  listMessageBodies,
  mutateDocument,
  readDocument,
  readMessageBody,
  upsertMessageBody,
} from "./db";
import { normalizeCondolence } from "./condolence";
import { isValidTurkishIban, slugifyTR } from "./format";
import { CATALOG_GALLERY_PHOTOS } from "./katalog";
import { DEFAULT_NAV_ITEMS, INITIAL_STORE_DATA } from "./seed";
import {
  BoardMember,
  Condolence,
  ContactMessage,
  GalleryPhoto,
  PageBlock,
  PageConfig,
  PageRevision,
  Post,
  PublishStatus,
  SiteSettings,
  StoreData,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const LOCAL_MESSAGES_PATH = path.join(DATA_DIR, "messages.enc.json");

const CONTENT_DOC_KEY = "content";

export class VersionConflictError extends Error {
  public readonly currentVersion: number;
  constructor(currentVersion: number, message?: string) {
    super(
      message ||
        "İçerik başka bir oturumda veya sekmede güncellendi. Lütfen sayfayı yenileyip tekrar deneyin."
    );
    this.name = "VersionConflictError";
    this.currentVersion = currentVersion;
  }
}

export class StoreReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreReadError";
  }
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function cloneInitial(): StoreData {
  return JSON.parse(JSON.stringify(INITIAL_STORE_DATA)) as StoreData;
}

function sanitizePageBlocks(
  rawBlocks: PageBlock[],
  defaultBlocks: PageBlock[],
  needsCatalogMigration: boolean
): PageBlock[] {
  const legacyKoyRe = /\/images\/koy\//i;
  const defById = new Map(defaultBlocks.map((b) => [b.id, b]));
  const updated = rawBlocks.map((blk) => {
    const rawData = blk.data || {};
    const d =
      typeof rawData.content === "string" &&
      /\[Yönetici Girişi\]\(\/(?:admin|yonetmenbgc)\)/i.test(rawData.content)
        ? {
            ...rawData,
            content: rawData.content
              .replace(
                /\[Yönetici Girişi\]\(\/(?:admin|yonetmenbgc)\)\s+sayfasından/gi,
                "yönetici panelinden"
              )
              .replace(
                /\[Yönetici Girişi\]\(\/(?:admin|yonetmenbgc)\)/gi,
                "yönetici paneli"
              ),
          }
        : rawData;
    const imgUrl = typeof d.image_url === "string" ? d.image_url : "";
    if (
      (imgUrl && legacyKoyRe.test(imgUrl)) ||
      (blk.id === "home-hero" &&
        imgUrl === "/images/katalog/04-kirsal-yasam-tarim/04_sivas_daglar.webp") ||
      (blk.id === "koy-hero" &&
        imgUrl === "/images/katalog/04-kirsal-yasam-tarim/07_geminbeli_manzara.webp")
    ) {
      const defMatch = defById.get(blk.id);
      if (defMatch) {
        return { ...blk, data: { ...defMatch.data } };
      }
      return {
        ...blk,
        data: {
          ...d,
          image_url:
            "/images/katalog/01-koy-cevresi/01_kalekoy_kivsak_arasi_manzara.webp",
          image_attribution:
            "Fotoğraf: cankurtaran • CC BY 3.0 (Wikimedia Commons — Yıldızeli bölgesi)",
          image_attribution_url:
            "https://commons.wikimedia.org/wiki/File:Kalek%C3%B6y_k%C4%B1vsak_aras%C4%B1_-_panoramio.jpg",
        },
      };
    }
    return d === rawData ? blk : { ...blk, data: d };
  });

  if (needsCatalogMigration) {
    const existingIds = new Set(updated.map((b) => b.id));
    for (const defBlk of defaultBlocks) {
      if (
        (defBlk.id === "koy-agri-split" ||
          defBlk.id === "koy-regional-showcase") &&
        !existingIds.has(defBlk.id)
      ) {
        updated.push(defBlk);
      }
    }
  }

  return updated;
}

function stripMuhtarFromPage(rp: PageConfig, defPage?: PageConfig): PageConfig {
  const muhtarRe = /muhtar|özüdoğru|0536 722/i;
  const oldIletisimSchoolRe = /Ortaokulu\s*\(Tel:\s*0346 753 11 22\)/i;
  const defById = new Map((defPage?.blocks || []).map((b) => [b.id, b]));
  const blocks = Array.isArray(rp.blocks)
    ? rp.blocks.map((blk) => {
        const serialized = JSON.stringify(blk);
        if (!muhtarRe.test(serialized) && !(rp.slug === "/iletisim" && oldIletisimSchoolRe.test(serialized))) {
          return blk;
        }
        const defBlk = defById.get(blk.id);
        return defBlk ? defBlk : blk;
      })
    : defPage?.blocks || [];
  return {
    ...rp,
    seo_title:
      rp.seo_title && muhtarRe.test(rp.seo_title)
        ? defPage?.seo_title || rp.seo_title.replace(/\s*ve\s*Muhtarlık/gi, "")
        : rp.seo_title,
    seo_description:
      rp.seo_description && (muhtarRe.test(rp.seo_description) || (rp.slug === "/iletisim" && /Ortaokulu/i.test(rp.seo_description)))
        ? defPage?.seo_description || ""
        : rp.seo_description,
    blocks,
  };
}

function mergeDefaultPages(
  rawPages: PageConfig[] | undefined,
  defaultPages: PageConfig[],
  needsCatalogMigration = false
): PageConfig[] {
  if (!Array.isArray(rawPages) || rawPages.length === 0) {
    return defaultPages;
  }
  const defBySlug = new Map(defaultPages.map((dp) => [dp.slug, dp]));
  const bySlug = new Map<string, PageConfig>();
  for (const dp of defaultPages) {
    bySlug.set(dp.slug, dp);
  }
  for (const rp of rawPages) {
    if (rp && typeof rp.slug === "string") {
      const defPage = defBySlug.get(rp.slug);
      const blocks = Array.isArray(rp.blocks)
        ? sanitizePageBlocks(rp.blocks, defPage?.blocks || [], needsCatalogMigration)
        : defPage?.blocks || [];
      bySlug.set(rp.slug, stripMuhtarFromPage({ ...rp, blocks }, defPage));
    }
  }
  return Array.from(bySlug.values());
}

function sanitizeLegacyPlaceholders(
  posts: Post[],
  condolences: Condolence[],
  boardMembers: BoardMember[],
  galleryPhotos: GalleryPhoto[],
  settings: SiteSettings
): {
  posts: Post[];
  condolences: Condolence[];
  boardMembers: BoardMember[];
  galleryPhotos: GalleryPhoto[];
  settings: SiteSettings;
  needsCatalogMigration: boolean;
} {
  const cleanIbanRaw = (settings.iban_number || "").trim();
  const ibanClean =
    cleanIbanRaw &&
    !/^TR00/i.test(cleanIbanRaw.replace(/\s+/g, "")) &&
    isValidTurkishIban(cleanIbanRaw)
      ? cleanIbanRaw
      : "";

  const bankRaw = (settings.iban_bank || "").trim();
  const bankClean = /panelden|banka adı giriniz|örnek/i.test(bankRaw)
    ? ""
    : bankRaw;

  const emailRaw = (settings.association_email || "").trim();
  const emailClean = /buyukakoren\.org|örnek/i.test(emailRaw) ? "" : emailRaw;

  const noteRaw = (settings.donation_note || "").trim();
  const noteClean = /yönetici panelinden güncellenebilir/i.test(noteRaw)
    ? ""
    : noteRaw;

  const cleanCondolences = condolences
    .filter((c) => !/örnek|panelden/i.test(c.deceased_name || ""))
    .map(normalizeCondolence);

  const cleanBoard = boardMembers.filter(
    (m) =>
      Boolean(m.full_name?.trim()) &&
      !/panelden|örnek/i.test(m.full_name || "")
  );

  const legacyKoyRe = /\/images\/koy\//i;
  const needsCatalogMigration = !galleryPhotos.some((g) =>
    (g.id || "").startsWith("gal-kat-")
  );
  const seedPostMap = new Map(
    INITIAL_STORE_DATA.posts.map((sp) => [sp.id, sp])
  );
  const seedPostByTitle = new Map(
    INITIAL_STORE_DATA.posts.map((sp) => [sp.title.trim().toLowerCase(), sp])
  );

  const cleanPosts = posts
    .filter(
      (p) =>
        !/lorem implus|bu bir deneme|örnek posttur|sistem denemesi|gizli taslak test/i.test(
          `${p.title || ""} ${p.summary || ""} ${p.content || ""}`
        )
    )
    .map((p) => {
      const seedMatch =
        seedPostMap.get(p.id) ||
        seedPostByTitle.get((p.title || "").trim().toLowerCase());
      const hasLegacyImg = Boolean(p.image_url && legacyKoyRe.test(p.image_url));
      if (hasLegacyImg || (!p.image_url && seedMatch?.image_url)) {
        return {
          ...p,
          image_url: seedMatch?.image_url ?? null,
          image_alt: p.image_alt || seedMatch?.image_alt || null,
          image_attribution:
            p.image_attribution || seedMatch?.image_attribution || null,
          extra_images: p.extra_images || seedMatch?.extra_images || null,
        };
      }
      if (!p.extra_images && seedMatch?.extra_images) {
        return { ...p, extra_images: seedMatch.extra_images };
      }
      return p;
    });

  if (needsCatalogMigration) {
    const seedPost6 = seedPostMap.get("post-6");
    if (
      seedPost6 &&
      !cleanPosts.some(
        (p) => p.id === seedPost6.id || p.slug === seedPost6.slug
      )
    ) {
      cleanPosts.push(seedPost6);
    }
  }

  const filteredGallery = galleryPhotos.filter(
    (g) => !legacyKoyRe.test(g.image_url || "")
  );
  const cleanGallery = needsCatalogMigration
    ? [...filteredGallery, ...CATALOG_GALLERY_PHOTOS]
    : filteredGallery;

  return {
    posts: cleanPosts,
    condolences: cleanCondolences,
    boardMembers: cleanBoard,
    galleryPhotos: cleanGallery,
    settings: {
      ...settings,
      iban_number: ibanClean,
      iban_bank: bankClean,
      association_email: emailClean,
      donation_note: noteClean,
    },
    needsCatalogMigration,
  };
}

function normalizeStore(raw: Partial<StoreData> | null | undefined): StoreData {
  const defaults = cloneInitial();
  if (!raw || typeof raw !== "object") {
    return {
      version: 1,
      updated_at: new Date().toISOString(),
      ...defaults,
      contact_messages: [],
      pages: defaults.pages || [],
    };
  }
  const rawSettingsObj = (raw.site_settings || {}) as Record<string, unknown>;
  const {
    mukhtar_name: _dropMukhtarName,
    mukhtar_phone: _dropMukhtarPhone,
    ...restRawSettings
  } = rawSettingsObj;
  void _dropMukhtarName;
  void _dropMukhtarPhone;
  const rawSettings = restRawSettings as Partial<SiteSettings>;
  const navItems =
    Array.isArray(rawSettings.nav_items) && rawSettings.nav_items.length > 0
      ? rawSettings.nav_items.map((item) =>
          item && typeof item.label === "string" && /muhtar/i.test(item.label)
            ? { ...item, label: "İletişim" }
            : item
        )
      : defaults.site_settings.nav_items || DEFAULT_NAV_ITEMS;

  const hasCustomPhone =
    typeof rawSettings.association_phone === "string" &&
    rawSettings.association_phone.trim().length > 0;
  const mergedSettings: SiteSettings = {
    ...defaults.site_settings,
    ...rawSettings,
    association_phone: hasCustomPhone
      ? rawSettings.association_phone
      : "+90 542 349 58 90",
    show_association_phone: hasCustomPhone
      ? Boolean(rawSettings.show_association_phone)
      : true,
    nav_items: navItems,
    ataturk_ribbon_visible: true,
    ataturk_ribbon_text:
      typeof rawSettings.ataturk_ribbon_text === "string"
        ? rawSettings.ataturk_ribbon_text
        : defaults.site_settings.ataturk_ribbon_text || "Sonsuza Dek",
  };

  const cleaned = sanitizeLegacyPlaceholders(
    Array.isArray(raw.posts) ? raw.posts : defaults.posts,
    Array.isArray(raw.condolences) ? raw.condolences : defaults.condolences,
    Array.isArray(raw.board_members) ? raw.board_members : defaults.board_members,
    Array.isArray(raw.gallery_photos) ? raw.gallery_photos : defaults.gallery_photos,
    mergedSettings
  );

  return {
    version: typeof raw.version === "number" && raw.version >= 1 ? raw.version : 1,
    updated_at: raw.updated_at || new Date().toISOString(),
    posts: cleaned.posts,
    condolences: cleaned.condolences,
    gallery_photos: cleaned.galleryPhotos,
    board_members: cleaned.boardMembers,
    site_settings: cleaned.settings,
    contact_messages: [], // PII asla genel state blob'unda saklanmaz
    pages: mergeDefaultPages(
      raw.pages,
      defaults.pages || [],
      cleaned.needsCatalogMigration
    ),
  };
}

export function encodeMessage(msg: ContactMessage): string {
  const json = JSON.stringify(msg);
  return isEncryptionConfigured() ? encryptServerData(json) : json;
}

export function decodeMessage(rawText: string): ContactMessage | null {
  try {
    const trimmed = rawText.trim();
    if (!trimmed) return null;
    const plain = isEncryptedPayload(trimmed)
      ? decryptServerData(trimmed)
      : trimmed;
    const parsed = JSON.parse(plain) as ContactMessage;
    if (!parsed || typeof parsed.id !== "string") return null;
    return parsed;
  } catch (err) {
    console.error("[store] Şifreli mesaj çözümlenemedi:", err);
    return null;
  }
}

/** Mesajı şifreli olarak veritabanına yazar (aynı kimlik varsa günceller). */
export async function persistMessage(msg: ContactMessage): Promise<void> {
  if (!isEncryptionConfigured()) {
    throw new Error(
      "Kritik Güvenlik Hatası: şifreleme anahtarı yapılandırılmadan mesajlar veritabanına açık metin yazılamaz."
    );
  }
  await upsertMessageBody(msg.id, msg.created_at, encodeMessage(msg));
}

function mergeMessages(
  primary: ContactMessage[],
  secondary: ContactMessage[]
): ContactMessage[] {
  const byId = new Map<string, ContactMessage>();
  for (const m of secondary) {
    if (m && m.id) byId.set(m.id, m);
  }
  for (const m of primary) {
    if (m && m.id) byId.set(m.id, m);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function readLocalEncryptedMessages(): ContactMessage[] {
  try {
    if (!fs.existsSync(LOCAL_MESSAGES_PATH)) return [];
    const text = fs.readFileSync(LOCAL_MESSAGES_PATH, "utf-8").trim();
    if (!text) return [];
    const plain = isEncryptedPayload(text) ? decryptServerData(text) : text;
    const arr = JSON.parse(plain) as ContactMessage[];
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error("[store] Yerel şifreli mesajlar okunamadı:", err);
    return [];
  }
}

function writeLocalEncryptedMessages(messages: ContactMessage[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const json = JSON.stringify(messages, null, 2);
  const payload = isEncryptionConfigured() ? encryptServerData(json) : json;
  fs.writeFileSync(LOCAL_MESSAGES_PATH, payload, "utf-8");
}

function readLocalStoreFile(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      if (
        Array.isArray(parsed.contact_messages) &&
        parsed.contact_messages.length > 0
      ) {
        try {
          const existingEnc = readLocalEncryptedMessages();
          const merged = mergeMessages(existingEnc, parsed.contact_messages);
          writeLocalEncryptedMessages(merged);
          const clean = normalizeStore(parsed);
          fs.writeFileSync(STORE_PATH, JSON.stringify(clean, null, 2), "utf-8");
          return clean;
        } catch (writeErr) {
          console.error("[store] Yerel mesaj taşıma/yazma atlandı (salt okunur FS olabilir):", writeErr);
        }
      }
      return normalizeStore(parsed);
    }

    const initial = normalizeStore(cloneInitial());
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
    } catch (writeErr) {
      console.error("[store] İlk yerel veri dosyası yazılamadı, bellekten dönülüyor:", writeErr);
    }
    return initial;
  } catch (err) {
    console.error("[store] Yerel veri dosyası okunamadı, varsayılan veriye dönülüyor:", err);
    return normalizeStore(cloneInitial());
  }
}

function parseContentDocument(body: string | null): StoreData {
  if (!body) return normalizeStore(cloneInitial());
  let parsed: Partial<StoreData>;
  try {
    parsed = JSON.parse(body) as Partial<StoreData>;
  } catch {
    throw new StoreReadError("Kayıtlı site içeriği JSON olarak okunamadı.");
  }
  return normalizeStore(parsed);
}

function nextContentState(
  current: StoreData,
  updater: (current: StoreData) => StoreData,
  expectedVersion?: number
): StoreData {
  const currentVersion = current.version ?? 1;
  if (
    typeof expectedVersion === "number" &&
    !Number.isNaN(expectedVersion) &&
    expectedVersion !== currentVersion
  ) {
    throw new VersionConflictError(currentVersion);
  }
  const updated = normalizeStore(updater(current));
  updated.version = currentVersion + 1;
  updated.updated_at = new Date().toISOString();
  updated.contact_messages = [];
  return updated;
}

async function readContentState(): Promise<StoreData> {
  if (isDbConfigured()) {
    try {
      return parseContentDocument(await readDocument(CONTENT_DOC_KEY));
    } catch (err) {
      // Yalnız okuma: ziyaretçi sayfası açık kalsın. Yazmalar kendi kilitli okumalarını yapar,
      // bu yedek içerik hiçbir zaman veritabanına geri yazılmaz.
      console.error("[store] Veritabanı okunamadı, varsayılan içerik gösteriliyor:", err);
      return normalizeStore(cloneInitial());
    }
  }
  return readLocalStoreFile();
}

/** Ham içerik belgesini (taşıma için) yazar; yalnız henüz hiç düzenlenmemiş veritabanına. */
export async function importContentStateIfPristine(
  raw: Partial<StoreData>
): Promise<boolean> {
  return mutateDocument(CONTENT_DOC_KEY, (body) => {
    if (body) {
      const current = parseContentDocument(body);
      if ((current.version ?? 1) > 1) {
        return { body, result: false };
      }
    }
    const imported = normalizeStore(raw);
    imported.version = Math.max(2, (imported.version ?? 1) + 1);
    imported.updated_at = new Date().toISOString();
    imported.contact_messages = [];
    return { body: JSON.stringify(imported), result: true };
  });
}

async function mutateContentState(
  updater: (current: StoreData) => StoreData,
  expectedVersion?: number
): Promise<StoreData> {
  if (isDbConfigured()) {
    return mutateDocument(CONTENT_DOC_KEY, (body) => {
      const updated = nextContentState(parseContentDocument(body), updater, expectedVersion);
      return { body: JSON.stringify(updated), result: updated };
    });
  }

  const updated = nextContentState(readLocalStoreFile(), updater, expectedVersion);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export function isPostPubliclyVisible(post: Post, now = new Date()): boolean {
  if (!post.is_published) return false;
  if (post.status === "draft" || post.status === "archived") return false;
  const pubTime = new Date(post.published_at).getTime();
  if (!Number.isNaN(pubTime) && pubTime > now.getTime()) return false;
  return true;
}

function ensureUniqueSlug(
  baseInput: string,
  posts: Post[],
  excludePostId?: string
): string {
  const base = slugifyTR(baseInput) || `yazi-${Date.now()}`;
  const used = new Set<string>();
  for (const p of posts) {
    if (excludePostId && p.id === excludePostId) continue;
    used.add(p.slug);
    if (Array.isArray(p.previous_slugs)) {
      for (const old of p.previous_slugs) used.add(old);
    }
  }
  if (!used.has(base)) return base;
  let counter = 2;
  while (used.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return (
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  });
}

// ---------- CONTACT MESSAGES (ŞİFRELİ ÖZEL DEPO) ----------
export async function getContactMessages(): Promise<ContactMessage[]> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const { data, error } = await sb
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[supabase] contact_messages okunamadı:", error.message);
    } else if (data) {
      return data as ContactMessage[];
    }
  }

  if (isDbConfigured()) {
    const bodies = await listMessageBodies();
    return bodies
      .map((b) => decodeMessage(b))
      .filter((m): m is ContactMessage => m !== null);
  }

  return readLocalEncryptedMessages();
}

export async function getStoreVersion(): Promise<number> {
  const state = await readContentState();
  return state.version ?? 1;
}

/**
 * Varsayılan olarak (includePrivateAndDrafts = false) ziyaretçiler için yalnızca
 * yayındaki içerikleri döndürür ve contact_messages alanını boş bırakır (taslak & KVKK koruması).
 */
export async function getAllStoreData(
  includePrivateAndDrafts = false
): Promise<StoreData> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const [postsRes, condRes, galRes, boardRes, setRes] = await Promise.all([
      sb
        .from("posts")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false }),
      sb
        .from("condolences")
        .select("*")
        .order("funeral_date", { ascending: false }),
      sb
        .from("gallery_photos")
        .select("*")
        .order("created_at", { ascending: false }),
      sb
        .from("board_members")
        .select("*")
        .order("display_order", { ascending: true }),
      sb.from("site_settings").select("*").limit(1).maybeSingle(),
    ]);
    for (const r of [postsRes, condRes, galRes, boardRes, setRes]) {
      if (r.error) console.error("[supabase] okuma hatası:", r.error.message);
    }
    const posts = ((postsRes.data as Post[]) || []).filter((p) =>
      includePrivateAndDrafts ? true : isPostPubliclyVisible(p)
    );
    const condolences = ((condRes.data as Condolence[]) || []).filter((c) =>
      includePrivateAndDrafts ? true : c.is_published && c.status !== "archived"
    );
    const contactMessages = includePrivateAndDrafts
      ? await getContactMessages()
      : [];
    return {
      version: 1,
      posts,
      condolences,
      gallery_photos:
        (galRes.data as GalleryPhoto[]) || INITIAL_STORE_DATA.gallery_photos,
      board_members:
        (boardRes.data as BoardMember[]) || INITIAL_STORE_DATA.board_members,
      site_settings:
        (setRes.data as SiteSettings) || INITIAL_STORE_DATA.site_settings,
      contact_messages: contactMessages,
      pages: INITIAL_STORE_DATA.pages || [],
    };
  }

  const state = await readContentState();
  const posts = sortPosts(
    includePrivateAndDrafts
      ? state.posts
      : state.posts.filter((p) => isPostPubliclyVisible(p))
  );
  const condolences = (
    includePrivateAndDrafts
      ? state.condolences
      : state.condolences.filter(
          (c) => c.is_published && c.status !== "archived"
        )
  ).sort((a, b) => (b.funeral_date > a.funeral_date ? 1 : -1));
  const contactMessages = includePrivateAndDrafts
    ? await getContactMessages()
    : [];

  return {
    ...state,
    posts,
    condolences,
    contact_messages: contactMessages,
  };
}

export async function getPublishedPosts(): Promise<Post[]> {
  const data = await getAllStoreData(false);
  return data.posts;
}

export async function getPostBySlug(
  slug: string,
  includeDrafts = false
): Promise<Post | null> {
  const res = await getPostBySlugWithRedirect(slug, includeDrafts);
  return res.post;
}

export async function getPostBySlugWithRedirect(
  slug: string,
  includeDrafts = false
): Promise<{ post: Post | null; redirectToSlug?: string }> {
  const data = await getAllStoreData(includeDrafts);
  const direct = data.posts.find((p) => p.slug === slug);
  if (direct) {
    return { post: direct };
  }
  const historical = data.posts.find(
    (p) => Array.isArray(p.previous_slugs) && p.previous_slugs.includes(slug)
  );
  if (historical) {
    return { post: historical, redirectToSlug: historical.slug };
  }
  return { post: null };
}

export async function createOrUpdatePost(
  postInput: Omit<Post, "id" | "created_at"> & { id?: string },
  expectedVersion?: number
): Promise<Post & { _version?: number }> {
  const nowIso = new Date().toISOString();
  const status: PublishStatus =
    postInput.status ||
    (postInput.is_published === false ? "draft" : "published");
  const isPublished = status === "published" && postInput.is_published !== false;

  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const id = postInput.id || `post-${Date.now()}`;
    const { data, error } = await sb
      .from("posts")
      .upsert({
        ...postInput,
        id,
        status,
        is_published: isPublished,
        updated_at: nowIso,
        created_at: nowIso,
      })
      .select()
      .single();
    if (error) {
      console.error("[supabase] post kaydedilemedi:", error.message);
      throw new Error(`İçerik kaydedilemedi: ${error.message}`);
    }
    return data as Post;
  }

  let savedPost!: Post;
  const next = await mutateContentState((current) => {
    const existing = postInput.id
      ? current.posts.find((p) => p.id === postInput.id)
      : undefined;

    if (existing) {
      // Mevcut yazıda slug kalıcıdır; başlık değişse bile değişmez.
      // Yalnızca açıkça farklı slug geçilirse güncellenir ve eskisi previous_slugs'a eklenir.
      let finalSlug = existing.slug;
      const prevSlugs = Array.isArray(existing.previous_slugs)
        ? [...existing.previous_slugs]
        : [];

      const requestedSlug =
        typeof postInput.slug === "string" && postInput.slug.trim()
          ? slugifyTR(postInput.slug)
          : "";
      const titleSlug = slugifyTR(postInput.title);
      // AdminDashboard legacy submit her seferinde slugifyTR(title) gönderir; başlık değişimi
      // veya açıkça verilmemiş olması slug'ı değiştirmemeli!
      const isExplicitCustomSlug =
        Boolean(requestedSlug) &&
        requestedSlug !== existing.slug &&
        requestedSlug !== titleSlug;

      if (isExplicitCustomSlug) {
        finalSlug = ensureUniqueSlug(requestedSlug, current.posts, existing.id);
        if (!prevSlugs.includes(existing.slug)) {
          prevSlugs.push(existing.slug);
        }
      }

      savedPost = {
        ...existing,
        ...postInput,
        id: existing.id,
        slug: finalSlug,
        previous_slugs: prevSlugs,
        status,
        is_published: isPublished,
        updated_at: nowIso,
        created_at: existing.created_at,
      };
      return {
        ...current,
        posts: current.posts.map((p) => (p.id === existing.id ? savedPost : p)),
      };
    }

    const uniqueSlug = ensureUniqueSlug(
      postInput.slug || postInput.title,
      current.posts
    );
    savedPost = {
      ...postInput,
      id: postInput.id || `post-${Date.now()}`,
      slug: uniqueSlug,
      previous_slugs: [],
      status,
      is_published: isPublished,
      published_at: postInput.published_at || nowIso,
      updated_at: nowIso,
      created_at: nowIso,
    };
    return {
      ...current,
      posts: [savedPost, ...current.posts],
    };
  }, expectedVersion);

  return { ...savedPost, _version: next.version };
}

export async function deletePost(
  id: string,
  expectedVersion?: number
): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const { error } = await sb.from("posts").delete().eq("id", id);
    if (error) {
      console.error("[supabase] post silinemedi:", error.message);
      throw new Error(`İçerik silinemedi: ${error.message}`);
    }
    return;
  }

  await mutateContentState(
    (current) => ({
      ...current,
      posts: current.posts.filter((p) => p.id !== id),
    }),
    expectedVersion
  );
}

export async function createCondolence(
  input: Omit<Condolence, "id" | "created_at"> & { id?: string },
  expectedVersion?: number
): Promise<Condolence> {
  const nowIso = new Date().toISOString();
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const id = input.id || `cond-${Date.now()}`;
    const { data, error } = await sb
      .from("condolences")
      .upsert({ ...input, id, created_at: nowIso })
      .select()
      .single();
    if (error) {
      console.error("[supabase] taziye kaydedilemedi:", error.message);
      throw new Error(`Taziye kaydedilemedi: ${error.message}`);
    }
    return data as Condolence;
  }

  let savedCondolence!: Condolence;
  await mutateContentState((current) => {
    const existing = input.id
      ? current.condolences.find((c) => c.id === input.id)
      : undefined;

    if (existing) {
      savedCondolence = {
        ...existing,
        ...input,
        id: existing.id,
        created_at: existing.created_at,
      };
      return {
        ...current,
        condolences: current.condolences.map((c) =>
          c.id === existing.id ? savedCondolence : c
        ),
      };
    }

    savedCondolence = {
      ...input,
      id: input.id || `cond-${Date.now()}`,
      status: input.is_published === false ? "archived" : "published",
      family_consent_confirmed: Boolean(input.family_consent_confirmed),
      created_at: nowIso,
    };
    return {
      ...current,
      condolences: [savedCondolence, ...current.condolences],
    };
  }, expectedVersion);

  return savedCondolence;
}

export async function deleteCondolence(
  id: string,
  expectedVersion?: number
): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const { error } = await sb.from("condolences").delete().eq("id", id);
    if (error) {
      console.error("[supabase] taziye silinemedi:", error.message);
      throw new Error(`Taziye silinemedi: ${error.message}`);
    }
    return;
  }

  await mutateContentState(
    (current) => ({
      ...current,
      condolences: current.condolences.filter((c) => c.id !== id),
    }),
    expectedVersion
  );
}

export async function createGalleryPhoto(
  input: Omit<GalleryPhoto, "id" | "created_at"> & { id?: string },
  expectedVersion?: number
): Promise<GalleryPhoto> {
  const nowIso = new Date().toISOString();
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const id = input.id || `gal-${Date.now()}`;
    const { data, error } = await sb
      .from("gallery_photos")
      .upsert({ ...input, id, created_at: nowIso })
      .select()
      .single();
    if (error) {
      console.error("[supabase] galeri kaydedilemedi:", error.message);
      throw new Error(`Fotoğraf kaydedilemedi: ${error.message}`);
    }
    return data as GalleryPhoto;
  }

  const saved: GalleryPhoto = {
    ...input,
    id: input.id || `gal-${Date.now()}`,
    created_at: nowIso,
  };

  await mutateContentState(
    (current) => ({
      ...current,
      gallery_photos: [saved, ...current.gallery_photos],
    }),
    expectedVersion
  );

  return saved;
}

export async function deleteGalleryPhoto(
  id: string,
  expectedVersion?: number
): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const { error } = await sb.from("gallery_photos").delete().eq("id", id);
    if (error) {
      console.error("[supabase] galeri silinemedi:", error.message);
      throw new Error(`Fotoğraf silinemedi: ${error.message}`);
    }
    return;
  }

  await mutateContentState(
    (current) => ({
      ...current,
      gallery_photos: current.gallery_photos.filter((g) => g.id !== id),
    }),
    expectedVersion
  );
}

export async function updateSettingsAndBoard(
  settingsPartial?: Partial<SiteSettings>,
  boardMembers?: BoardMember[],
  expectedVersion?: number
): Promise<StoreData> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    if (settingsPartial) {
      const { error } = await sb
        .from("site_settings")
        .upsert({ id: "main", ...settingsPartial });
      if (error) {
        console.error("[supabase] ayarlar kaydedilemedi:", error.message);
        throw new Error(`Ayarlar kaydedilemedi: ${error.message}`);
      }
    }
    if (boardMembers) {
      const { error: delErr } = await sb
        .from("board_members")
        .delete()
        .neq("id", "never");
      if (delErr) {
        console.error("[supabase] kurul temizlenemedi:", delErr.message);
        throw new Error(`Kurul güncellenemedi: ${delErr.message}`);
      }
      if (boardMembers.length > 0) {
        const { error: insErr } = await sb
          .from("board_members")
          .insert(boardMembers);
        if (insErr) {
          console.error("[supabase] kurul eklenemedi:", insErr.message);
          throw new Error(`Kurul eklenemedi: ${insErr.message}`);
        }
      }
    }
    return getAllStoreData(true);
  }

  return await mutateContentState(
    (current) => ({
      ...current,
      site_settings: settingsPartial
        ? { ...current.site_settings, ...settingsPartial }
        : current.site_settings,
      board_members: boardMembers ?? current.board_members,
    }),
    expectedVersion
  );
}

export async function updateSiteSettings(
  partial: Partial<SiteSettings>
): Promise<SiteSettings> {
  const updated = await updateSettingsAndBoard(partial);
  return updated.site_settings;
}

export async function saveBoardMembers(
  members: BoardMember[]
): Promise<BoardMember[]> {
  const updated = await updateSettingsAndBoard(undefined, members);
  return updated.board_members;
}

// ---------- PAGES (SAYFA TASARIMCISI) ----------
export async function getPages(onlyPublished = false): Promise<PageConfig[]> {
  const state = await readContentState();
  const pages = state.pages || INITIAL_STORE_DATA.pages || [];
  const filtered = onlyPublished
    ? pages.filter((p) => p.status === "published")
    : pages;
  return [...filtered].sort((a, b) => (a.menu_order ?? 99) - (b.menu_order ?? 99));
}

export async function getPageBySlug(
  slug: string,
  includeDrafts = false
): Promise<PageConfig | null> {
  const normalized = slug === "/" ? "/" : `/${slug.replace(/^\/+|\/+$/g, "")}`;
  const pages = await getPages(!includeDrafts);
  return pages.find((p) => p.slug === normalized) || null;
}

export async function savePageConfig(
  pageInput: Omit<PageConfig, "updated_at" | "revisions"> & {
    blocks: PageBlock[];
  },
  savedBy: string,
  expectedVersion?: number
): Promise<{ page: PageConfig; version: number }> {
  const normalizedSlug =
    pageInput.slug === "/"
      ? "/"
      : `/${pageInput.slug.replace(/^\/+|\/+$/g, "").toLowerCase()}`;
  const nowIso = new Date().toISOString();

  let savedPage!: PageConfig;
  const next = await mutateContentState((s) => {
    const currentPages = s.pages || [];
    const existing = currentPages.find((p) => p.slug === normalizedSlug);

    let revisions: PageRevision[] = existing?.revisions
      ? [...existing.revisions]
      : [];
    if (existing) {
      revisions.unshift({
        id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        saved_at: existing.updated_at || nowIso,
        saved_by: existing.updated_by || savedBy,
        title: existing.title,
        seo_title: existing.seo_title,
        seo_description: existing.seo_description,
        blocks: existing.blocks,
      });
      revisions = revisions.slice(0, 10);
    }

    savedPage = {
      ...existing,
      ...pageInput,
      slug: normalizedSlug,
      updated_at: nowIso,
      updated_by: savedBy,
      revisions,
    };

    const existsInList = currentPages.some((p) => p.slug === normalizedSlug);
    const updatedPages = existsInList
      ? currentPages.map((p) => (p.slug === normalizedSlug ? savedPage : p))
      : [...currentPages, savedPage];

    return {
      ...s,
      pages: updatedPages,
    };
  }, expectedVersion);

  return { page: savedPage, version: next.version ?? 1 };
}

export async function rollbackPageRevision(
  slug: string,
  revisionId: string,
  restoredBy: string,
  expectedVersion?: number
): Promise<{ page: PageConfig | null; version: number }> {
  const normalizedSlug =
    slug === "/" ? "/" : `/${slug.replace(/^\/+|\/+$/g, "").toLowerCase()}`;
  let restored: PageConfig | null = null;

  const next = await mutateContentState((s) => {
    const pages = s.pages || [];
    const updated = pages.map((p) => {
      if (p.slug !== normalizedSlug) return p;
      const rev = (p.revisions || []).find((r) => r.id === revisionId);
      if (!rev) return p;

      const snapshot: PageRevision = {
        id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        saved_at: p.updated_at || new Date().toISOString(),
        saved_by: restoredBy,
        title: p.title,
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        blocks: p.blocks,
      };

      restored = {
        ...p,
        title: rev.title,
        seo_title: rev.seo_title,
        seo_description: rev.seo_description,
        blocks: rev.blocks,
        updated_at: new Date().toISOString(),
        updated_by: restoredBy,
        revisions: [snapshot, ...(p.revisions || [])].slice(0, 10),
      };
      return restored;
    });
    return { ...s, pages: updated };
  }, expectedVersion);

  return { page: restored, version: next.version ?? 1 };
}

export async function createContactMessage(
  input: Omit<ContactMessage, "id" | "is_read" | "created_at">
): Promise<ContactMessage> {
  const nowIso = new Date().toISOString();
  const saved: ContactMessage = {
    ...input,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    is_read: false,
    created_at: nowIso,
  };

  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const { data, error } = await sb
      .from("contact_messages")
      .insert(saved)
      .select()
      .single();
    if (error) {
      console.error("[supabase] contact_messages eklenemedi:", error.message);
      throw new Error(`Mesaj kaydedilemedi: ${error.message}`);
    }
    return data as ContactMessage;
  }

  if (isDbConfigured()) {
    await persistMessage(saved);
    return saved;
  }

  const existing = readLocalEncryptedMessages();
  writeLocalEncryptedMessages([saved, ...existing]);
  return saved;
}

export async function markMessageRead(
  id: string,
  isRead = true
): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const { error } = await sb
      .from("contact_messages")
      .update({ is_read: isRead })
      .eq("id", id);
    if (error) {
      console.error("[supabase] mesaj güncellenemedi:", error.message);
      throw new Error(`Mesaj güncellenemedi: ${error.message}`);
    }
    return;
  }

  if (isDbConfigured()) {
    const body = await readMessageBody(id);
    const msg = body ? decodeMessage(body) : null;
    if (msg) {
      msg.is_read = isRead;
      await persistMessage(msg);
    }
    return;
  }

  const existing = readLocalEncryptedMessages();
  const updated = existing.map((m) =>
    m.id === id ? { ...m, is_read: isRead } : m
  );
  writeLocalEncryptedMessages(updated);
}

export async function deleteContactMessage(id: string): Promise<void> {
  const sb = getSupabaseAdmin();
  if (sb && !isBlobConfigured() && !isDbConfigured()) {
    const { error } = await sb.from("contact_messages").delete().eq("id", id);
    if (error) {
      console.error("[supabase] mesaj silinemedi:", error.message);
      throw new Error(`Mesaj silinemedi: ${error.message}`);
    }
    return;
  }

  if (isDbConfigured()) {
    await deleteMessageRow(id);
    return;
  }

  const existing = readLocalEncryptedMessages();
  writeLocalEncryptedMessages(existing.filter((m) => m.id !== id));
}
