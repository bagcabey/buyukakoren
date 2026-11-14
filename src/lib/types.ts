export type PostCategory = "duyuru" | "haber" | "aciklama" | "faaliyet" | string;
export type ProjectStatus = "planlandi" | "devam_ediyor" | "tamamlandi";
export type PublishStatus = "draft" | "published" | "archived";
export type AdminRole = "yonetici" | "editor";

export interface ImageAttribution {
  author?: string;
  license?: string;
  license_url?: string;
  source_url?: string;
}

export interface PostExtraImage {
  image_url: string;
  title: string;
  description?: string;
  author?: string;
  license?: string;
  license_url?: string;
  source_url?: string;
}

export interface Post {
  id: string;
  slug: string;
  previous_slugs?: string[];
  category: PostCategory;
  title: string;
  summary: string;
  content: string;
  image_url?: string | null;
  image_alt?: string | null;
  image_attribution?: ImageAttribution | null;
  extra_images?: PostExtraImage[] | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  project_status?: ProjectStatus | null;
  is_pinned: boolean;
  is_published: boolean;
  status?: PublishStatus;
  published_at: string;
  updated_at?: string;
  created_at: string;
  author_name?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
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
  status?: "published" | "archived";
  family_consent_confirmed?: boolean;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  album: string;
  image_url: string;
  image_alt?: string | null;
  taken_year?: string | null;
  description?: string | null;
  attribution_author?: string | null;
  attribution_license?: string | null;
  attribution_url?: string | null;
  source_url?: string | null;
  created_at: string;
}

export interface BoardMember {
  id: string;
  full_name: string;
  role: string;
  bio?: string | null;
  display_order: number;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  order: number;
  is_external?: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface SiteSettings {
  association_name: string;
  short_name?: string;
  hero_title: string;
  hero_subtitle: string;
  hero_badge?: string | null;
  hero_image?: string | null;
  about_summary?: string | null;
  association_phone?: string | null;
  show_association_phone: boolean;
  association_email?: string | null;
  association_address?: string | null;
  working_hours?: string | null;
  iban_bank?: string | null;
  iban_account_name?: string | null;
  iban_number?: string | null;
  donation_note?: string | null;
  mukhtar_name?: string | null;
  mukhtar_phone?: string | null;
  founded_year?: string | null;
  association_registry_no?: string | null;
  tax_office?: string | null;
  custom_post_categories?: string[];
  custom_gallery_albums?: string[];
  nav_items?: NavItem[];
  footer_description?: string | null;
  footer_links?: NavItem[];
  social_links?: SocialLinks;
  ataturk_ribbon_visible?: boolean;
  ataturk_ribbon_text?: string | null;
}

export interface ContactMessage {
  id: string;
  sender_name: string;
  sender_phone?: string | null;
  subject: string;
  message: string;
  kvkk_consent?: boolean;
  ip_hash?: string;
  is_read: boolean;
  created_at: string;
}

export type PageBlockType =
  | "hero"
  | "rich_text"
  | "image"
  | "image_text"
  | "card_grid"
  | "stats"
  | "timeline"
  | "gallery_preview"
  | "latest_posts"
  | "cta"
  | "faq"
  | "contact_card"
  | "map"
  | "iban_card"
  | "board_members";

export interface PageBlock {
  id: string;
  type: PageBlockType;
  visible: boolean;
  order: number;
  data: Record<string, unknown>;
}

export interface PageRevision {
  id: string;
  saved_at: string;
  saved_by: string;
  title: string;
  seo_title?: string;
  seo_description?: string;
  blocks: PageBlock[];
}

export interface PageConfig {
  slug: string;
  title: string;
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  status: PublishStatus;
  show_in_menu: boolean;
  menu_order: number;
  menu_label?: string;
  blocks: PageBlock[];
  updated_at: string;
  updated_by?: string;
  revisions?: PageRevision[];
}

export interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  role: AdminRole;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  revoked_before?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  username: string;
  role: AdminRole | "system";
  action: string;
  target: string;
  detail?: string;
  ip_hash?: string;
}

export interface StoreData {
  version?: number;
  updated_at?: string;
  posts: Post[];
  condolences: Condolence[];
  gallery_photos: GalleryPhoto[];
  board_members: BoardMember[];
  site_settings: SiteSettings;
  contact_messages: ContactMessage[];
  pages?: PageConfig[];
}

export interface SecurityStateData {
  users: AdminUser[];
  revoked_tokens: Array<{ jti: string; exp: number }>;
  audit_logs: AuditLogEntry[];
  login_failures: Record<
    string,
    { count: number; firstAttemptAt: number; blockedUntil?: number }
  >;
  contact_submissions: Record<
    string,
    { count: number; firstAttemptAt: number; blockedUntil?: number }
  >;
}
