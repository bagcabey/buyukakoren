import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { INITIAL_STORE_DATA } from "./seed";
import {
  BoardMember,
  Condolence,
  ContactMessage,
  GalleryPhoto,
  Post,
  SiteSettings,
  StoreData,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const TMP_STORE_PATH = path.join(os.tmpdir(), "bakoren-store.json");

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function readLocalStore(): Promise<StoreData> {
  try {
    const tmpRaw = await fs.readFile(TMP_STORE_PATH, "utf-8");
    return JSON.parse(tmpRaw) as StoreData;
  } catch {
    // /tmp üzerinde henüz önbellek yoksa proje data/store.json dosyasını dene
  }

  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as StoreData;
  } catch {
    if (!process.env.VERCEL) {
      try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.writeFile(
          STORE_PATH,
          JSON.stringify(INITIAL_STORE_DATA, null, 2),
          "utf-8"
        );
      } catch {
        // Salt okunur ortamda sessizce bellekteki başlangıç verisini döndür
      }
    }
    return structuredClone(INITIAL_STORE_DATA);
  }
}

async function writeLocalStore(data: StoreData): Promise<void> {
  const serialized = JSON.stringify(data, null, 2);
  if (!process.env.VERCEL) {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(STORE_PATH, serialized, "utf-8");
      return;
    } catch {
      // Yerel yazma başarısızsa /tmp fallback'ine geç
    }
  }
  await fs.writeFile(TMP_STORE_PATH, serialized, "utf-8");
}

export async function getAllStoreData(): Promise<StoreData> {
  if (!isSupabaseConfigured()) {
    return readLocalStore();
  }
  const sb = getSupabaseAdmin();
  const [postsRes, condRes, galRes, boardRes, settingsRes, msgRes] =
    await Promise.all([
      sb.from("posts").select("*").order("published_at", { ascending: false }),
      sb
        .from("condolences")
        .select("*")
        .order("created_at", { ascending: false }),
      sb
        .from("gallery_photos")
        .select("*")
        .order("created_at", { ascending: false }),
      sb
        .from("board_members")
        .select("*")
        .order("display_order", { ascending: true }),
      sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      sb
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

  return {
    posts: (postsRes.data as Post[]) || INITIAL_STORE_DATA.posts,
    condolences: (condRes.data as Condolence[]) || [],
    gallery_photos: (galRes.data as GalleryPhoto[]) || [],
    board_members: (boardRes.data as BoardMember[]) || [],
    site_settings:
      (settingsRes.data as SiteSettings) || INITIAL_STORE_DATA.site_settings,
    contact_messages: (msgRes.data as ContactMessage[]) || [],
  };
}

export async function getPublishedPosts(): Promise<Post[]> {
  const data = await getAllStoreData();
  return data.posts
    .filter((p) => p.is_published)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const data = await getAllStoreData();
  return data.posts.find((p) => p.slug === slug) || null;
}

export async function createOrUpdatePost(
  input: Omit<Post, "id" | "created_at"> & { id?: string }
): Promise<Post> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    if (input.id) {
      const idx = store.posts.findIndex((p) => p.id === input.id);
      if (idx !== -1) {
        const updated: Post = {
          ...store.posts[idx],
          ...input,
          id: input.id,
        };
        store.posts[idx] = updated;
        await writeLocalStore(store);
        return updated;
      }
    }
    const created: Post = {
      ...input,
      id: `post-${crypto.randomUUID().slice(0, 8)}`,
      created_at: now,
    };
    store.posts.unshift(created);
    await writeLocalStore(store);
    return created;
  }

  const sb = getSupabaseAdmin();
  if (input.id) {
    const { data, error } = await sb
      .from("posts")
      .update(input)
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw error;
    return data as Post;
  }
  const { data, error } = await sb.from("posts").insert(input).select().single();
  if (error) throw error;
  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    store.posts = store.posts.filter((p) => p.id !== id);
    await writeLocalStore(store);
    return;
  }
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function createCondolence(
  input: Omit<Condolence, "id" | "created_at"> & { id?: string }
): Promise<Condolence> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    if (input.id) {
      const idx = store.condolences.findIndex((c) => c.id === input.id);
      if (idx !== -1) {
        const updated: Condolence = {
          ...store.condolences[idx],
          ...input,
          id: input.id,
        };
        store.condolences[idx] = updated;
        await writeLocalStore(store);
        return updated;
      }
    }
    const created: Condolence = {
      ...input,
      id: `cond-${crypto.randomUUID().slice(0, 8)}`,
      created_at: now,
    };
    store.condolences.unshift(created);
    await writeLocalStore(store);
    return created;
  }
  const sb = getSupabaseAdmin();
  if (input.id) {
    const { data, error } = await sb
      .from("condolences")
      .update(input)
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw error;
    return data as Condolence;
  }
  const { data, error } = await sb
    .from("condolences")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Condolence;
}

export async function deleteCondolence(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    store.condolences = store.condolences.filter((c) => c.id !== id);
    await writeLocalStore(store);
    return;
  }
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("condolences").delete().eq("id", id);
  if (error) throw error;
}

export async function createGalleryPhoto(
  input: Omit<GalleryPhoto, "id" | "created_at"> & { id?: string }
): Promise<GalleryPhoto> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    if (input.id) {
      const idx = store.gallery_photos.findIndex((g) => g.id === input.id);
      if (idx !== -1) {
        const updated: GalleryPhoto = {
          ...store.gallery_photos[idx],
          ...input,
          id: input.id,
        };
        store.gallery_photos[idx] = updated;
        await writeLocalStore(store);
        return updated;
      }
    }
    const created: GalleryPhoto = {
      ...input,
      id: `gal-${crypto.randomUUID().slice(0, 8)}`,
      created_at: now,
    };
    store.gallery_photos.unshift(created);
    await writeLocalStore(store);
    return created;
  }
  const sb = getSupabaseAdmin();
  if (input.id) {
    const { data, error } = await sb
      .from("gallery_photos")
      .update(input)
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw error;
    return data as GalleryPhoto;
  }
  const { data, error } = await sb
    .from("gallery_photos")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as GalleryPhoto;
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    store.gallery_photos = store.gallery_photos.filter((g) => g.id !== id);
    await writeLocalStore(store);
    return;
  }
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("gallery_photos").delete().eq("id", id);
  if (error) throw error;
}

export async function updateSiteSettings(
  input: SiteSettings
): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    store.site_settings = input;
    await writeLocalStore(store);
    return input;
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("site_settings")
    .upsert({ id: 1, ...input })
    .select()
    .single();
  if (error) throw error;
  return data as SiteSettings;
}

export async function saveBoardMembers(
  members: BoardMember[]
): Promise<BoardMember[]> {
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    store.board_members = members;
    await writeLocalStore(store);
    return members;
  }
  const sb = getSupabaseAdmin();
  await sb.from("board_members").delete().neq("id", "");
  if (members.length > 0) {
    const { error } = await sb.from("board_members").insert(members);
    if (error) throw error;
  }
  return members;
}

export async function createContactMessage(
  input: Omit<ContactMessage, "id" | "is_read" | "created_at">
): Promise<ContactMessage> {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    const created: ContactMessage = {
      ...input,
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      is_read: false,
      created_at: now,
    };
    store.contact_messages.unshift(created);
    await writeLocalStore(store);
    return created;
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("contact_messages")
    .insert({ ...input, is_read: false })
    .select()
    .single();
  if (error) throw error;
  return data as ContactMessage;
}

export async function markMessageRead(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    const msg = store.contact_messages.find((m) => m.id === id);
    if (msg) msg.is_read = true;
    await writeLocalStore(store);
    return;
  }
  const sb = getSupabaseAdmin();
  await sb.from("contact_messages").update({ is_read: true }).eq("id", id);
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await readLocalStore();
    store.contact_messages = store.contact_messages.filter((m) => m.id !== id);
    await writeLocalStore(store);
    return;
  }
  const sb = getSupabaseAdmin();
  await sb.from("contact_messages").delete().eq("id", id);
}
