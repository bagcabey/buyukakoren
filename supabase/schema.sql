-- Büyük Akören Köyü Derneği - Supabase Veritabanı Şeması
-- Supabase Dashboard > SQL Editor kısmında çalıştırabilirsiniz.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null check (category in ('duyuru', 'haber', 'aciklama', 'faaliyet')),
  title text not null,
  summary text not null,
  content text not null,
  image_url text,
  attachment_url text,
  project_status text check (project_status in ('planlandi', 'devam_ediyor', 'tamamlandi')),
  is_pinned boolean not null default false,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.condolences (
  id uuid primary key default gen_random_uuid(),
  deceased_name text not null,
  age_or_note text,
  funeral_date text not null,
  burial_place text not null,
  message text not null,
  relatives text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  album text not null,
  image_url text not null,
  taken_year text,
  created_at timestamptz not null default now()
);

create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,
  bio text,
  display_order int not null default 0
);

create table if not exists public.site_settings (
  id int primary key default 1,
  association_name text not null,
  hero_title text not null,
  hero_subtitle text not null,
  association_phone text,
  show_association_phone boolean not null default false,
  association_email text,
  association_address text,
  iban_bank text,
  iban_account_name text,
  iban_number text,
  donation_note text,
  mukhtar_phone text
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  sender_phone text,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
