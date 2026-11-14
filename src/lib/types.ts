export type PostCategory = "duyuru" | "haber" | "aciklama" | "faaliyet";
export type ProjectStatus = "planlandi" | "devam_ediyor" | "tamamlandi";

export interface Post {
  id: string;
  slug: string;
  category: PostCategory;
  title: string;
  summary: string;
  content: string;
  image_url?: string | null;
  attachment_url?: string | null;
  project_status?: ProjectStatus | null;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface Condolence {
  id: string;
  deceased_name: string;
  age_or_note?: string | null;
  funeral_date: string;
  burial_place: string;
  message: string;
  relatives?: string | null;
  is_published: boolean;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  album: string;
  image_url: string;
  taken_year?: string | null;
  created_at: string;
}

export interface BoardMember {
  id: string;
  full_name: string;
  role: string;
  bio?: string | null;
  display_order: number;
}

export interface SiteSettings {
  association_name: string;
  hero_title: string;
  hero_subtitle: string;
  association_phone?: string | null;
  show_association_phone: boolean;
  association_email?: string | null;
  association_address?: string | null;
  iban_bank?: string | null;
  iban_account_name?: string | null;
  iban_number?: string | null;
  donation_note?: string | null;
  mukhtar_phone?: string | null;
}

export interface ContactMessage {
  id: string;
  sender_name: string;
  sender_phone?: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface StoreData {
  posts: Post[];
  condolences: Condolence[];
  gallery_photos: GalleryPhoto[];
  board_members: BoardMember[];
  site_settings: SiteSettings;
  contact_messages: ContactMessage[];
}
