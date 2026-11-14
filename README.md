# B.Akören — Büyük Akören Köyü Derneği Web Portalı

Sivas Yıldızeli Büyük Akören (Büyükakören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği için **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** ve **Supabase** uyumlu kurumsal web sitesi ve yönetici paneli.

## Yerel Kurulum ve Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

### Yönetici Paneli
- Adres: `http://localhost:3000/admin`
- Varsayılan Şifre (yerel): `Bakoren2026!`
- Üretim ortamında `.env.local` veya Vercel Environment Variables üzerinden `ADMIN_PASSWORD` ve `ADMIN_SESSION_SECRET` değerlerini mutlaka değiştirin.

## Vercel + Supabase ile Canlı Yayın

1. Projeyi GitHub/GitLab deposuna pushlayın.
2. Vercel üzerinde projeyi import edin.
3. Kalıcı bulut veritabanı için [Supabase](https://supabase.com) projesi oluşturup `supabase/schema.sql` dosyasını SQL Editor'de çalıştırın.
4. Vercel Environment Variables kısmına şunları ekleyin:
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

> Not: Supabase değişkenleri tanımlanmadığında uygulama otomatik olarak yerel `data/store.json` dosyasını kullanır.
