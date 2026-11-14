-- Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği
-- Supabase PostgreSQL Şeması ve Satır Düzeyi Güvenlik (RLS) Politikaları

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  previous_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'duyuru',
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_alt TEXT,
  image_attribution JSONB,
  attachment_url TEXT,
  attachment_name TEXT,
  project_status TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_name TEXT,
  seo_title TEXT,
  seo_description TEXT
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_public_select_published" ON posts;
CREATE POLICY "posts_public_select_published" ON posts
  FOR SELECT TO anon, authenticated
  USING (is_published = true AND status = 'published' AND published_at <= NOW());

DROP POLICY IF EXISTS "posts_service_all" ON posts;
CREATE POLICY "posts_service_all" ON posts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS condolences (
  id TEXT PRIMARY KEY,
  deceased_name TEXT NOT NULL,
  age_or_note TEXT,
  funeral_date DATE NOT NULL DEFAULT CURRENT_DATE,
  burial_place TEXT NOT NULL DEFAULT 'Büyükakören Köyü Mezarlığı',
  message TEXT NOT NULL,
  relatives TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published',
  family_consent_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE condolences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "condolences_public_select_published" ON condolences;
CREATE POLICY "condolences_public_select_published" ON condolences
  FOR SELECT TO anon, authenticated
  USING (is_published = true AND status = 'published');

DROP POLICY IF EXISTS "condolences_service_all" ON condolences;
CREATE POLICY "condolences_service_all" ON condolences
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  album TEXT NOT NULL DEFAULT 'Yıldızeli ve Çevresi',
  image_url TEXT NOT NULL,
  image_alt TEXT,
  taken_year TEXT,
  description TEXT,
  attribution_author TEXT,
  attribution_license TEXT,
  attribution_url TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_public_select" ON gallery_photos;
CREATE POLICY "gallery_public_select" ON gallery_photos
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "gallery_service_all" ON gallery_photos;
CREATE POLICY "gallery_service_all" ON gallery_photos
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS board_members (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL,
  bio TEXT,
  display_order INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "board_public_select" ON board_members;
CREATE POLICY "board_public_select" ON board_members
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "board_service_all" ON board_members;
CREATE POLICY "board_service_all" ON board_members
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  association_name TEXT NOT NULL,
  short_name TEXT,
  hero_title TEXT NOT NULL DEFAULT '',
  hero_subtitle TEXT DEFAULT '',
  hero_badge TEXT,
  hero_image TEXT,
  about_summary TEXT,
  association_phone TEXT,
  show_association_phone BOOLEAN NOT NULL DEFAULT false,
  association_email TEXT,
  association_address TEXT,
  working_hours TEXT,
  iban_bank TEXT,
  iban_account_name TEXT,
  iban_number TEXT,
  donation_note TEXT,
  mukhtar_name TEXT,
  mukhtar_phone TEXT,
  founded_year TEXT,
  association_registry_no TEXT,
  tax_office TEXT,
  custom_post_categories JSONB DEFAULT '[]'::jsonb,
  custom_gallery_albums JSONB DEFAULT '[]'::jsonb,
  nav_items JSONB DEFAULT '[]'::jsonb,
  footer_description TEXT,
  footer_links JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  ataturk_ribbon_visible BOOLEAN NOT NULL DEFAULT true,
  ataturk_ribbon_text TEXT DEFAULT 'SONSUZA DEK'
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_select" ON site_settings;
CREATE POLICY "settings_public_select" ON site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "settings_service_all" ON site_settings;
CREATE POLICY "settings_service_all" ON site_settings
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_phone TEXT,
  subject TEXT NOT NULL DEFAULT 'Genel Talep',
  message TEXT NOT NULL,
  kvkk_consent BOOLEAN NOT NULL DEFAULT false,
  ip_hash TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_public_insert_only" ON contact_messages;
CREATE POLICY "contact_public_insert_only" ON contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (kvkk_consent = true);

DROP POLICY IF EXISTS "contact_service_all" ON contact_messages;
CREATE POLICY "contact_service_all" ON contact_messages
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  show_in_menu BOOLEAN NOT NULL DEFAULT true,
  menu_order INTEGER NOT NULL DEFAULT 10,
  menu_label TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  revisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pages_public_select_published" ON pages;
CREATE POLICY "pages_public_select_published" ON pages
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "pages_service_all" ON pages;
CREATE POLICY "pages_service_all" ON pages
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  username TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  detail TEXT,
  ip_hash TEXT
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_service_all" ON audit_logs;
CREATE POLICY "audit_service_all" ON audit_logs
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  revoked_before BIGINT
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_users_service_all" ON admin_users;
CREATE POLICY "admin_users_service_all" ON admin_users
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
