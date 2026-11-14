# Çalışma Günlüğü — Büyük Akören Köyü Derneği Web Portalı

Bu dosya, 14 Kasım 2026 teslim öncesi bakım ve geliştirme sürecindeki her aşamayı, yapılan değişiklikleri, test/build sonuçlarını ve canlı doğrulamaları kronolojik olarak kaydeder.

---

## Ön Hazırlık (Aşama 0) — 14.11.2026 04:51
- **Yedek Etiketi**: `yedek-teslim-oncesi-2026-11-14` oluşturuldu ve `origin` uzak deposuna (`--tags`) gönderildi.
- **Yerel Veri Yedeği**: `data/store.json` yedeği çalışma alanının geçici yedek dizinine kopyalandı.
- **Ortam Kontrolü**: Vercel CLI yerel oturumunun (`vercel whoami`) kapalı olduğu görüldü (`login_required`). Bu nedenle Vercel ortam değişkenleri (`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`) yerelden CLI ile eklenemedi; üretimde `BLOB_READ_WRITE_TOKEN` üzerinden türetilen sunucu anahtarı + AES-256-GCM şifreli yönetici kullanıcı deposu mimarisi kurulmasına ve ortam değişkeni gereksiniminin `TESLIM-ONCESI-EKSIKLER.md` dosyasına yazılmasına geçildi.
- **Derleme Aracı**: Next.js 16 ile kaldırılan `next lint` yerine `package.json` içinde `"lint": "tsc --noEmit"` tanımlandı.

## Aşama 1: Güvenlik ve Sistem Hataları — 14.11.2026 05:05
- **Kimlik Doğrulama ve Oturum**: `src/lib/auth.ts` içindeki hardcoded parola ve gizli anahtar fallback'leri kaldırıldı (`503` fail-closed). 12 saatlik süreli HMAC-SHA256 imzalı `jti` token yapısı, `crypto.timingSafeEqual` doğrulaması, sunucu taraflı oturum iptal listesi (`/api/auth/logout` sonrası eski çerezin `401` dönmesi) ve `yonetici`/`editor` rol ayrımı eklendi. `README.md` ve `.env.example` temizlendi.
- **Kaba Kuvvet ve Spam Koruması**: `src/lib/rate-limit.ts` ile girişte 5 hatalı deneme sonrası 15 dk `429 Too Many Requests` + kademeli gecikme; iletişim formunda IP hız sınırı, görünmez `website` honeypot alanı, minimum form doldurma süresi, uzunluk sınırları ve KVKK onay zorunluluğu eklendi.
- **KVKK ve Blob Şifreleme**: `src/lib/crypto.ts` (AES-256-GCM) ve `src/lib/security-store.ts` ile tüm iletişim mesajları, kullanıcı parolaları (`scrypt` + rastgele salt), oturum iptal kayıtları ve işlem günlüğü şifrelenerek `store/private/` altına ayrıldı. Yerelden canlıya mesaj iletimi (`store.ts` içindeki cross-env `fetch`) kaldırıldı.
- **Eşzamanlılık ve Taslak Koruması**: `store/state-v2.json` üzerinde ETag (`ifMatch`) ve `version` kontrolüyle `409 Conflict` koruması getirildi; okuma hatasında canlı verinin üzerine yazma ihtimali kapatıldı. `/api/posts?all=1` ve `/api/condolences?all=1` yetkisiz isteklere `401`, ziyaretçi rotaları taslaklara gerçek HTTP `404` (kök `loading.tsx` -> `/admin/loading.tsx` taşınarak Soft-404 engellendi) döndürecek şekilde sertleştirildi.
- **Dosya Yükleme ve Slug Sabitliği**: `/api/upload` yalnızca JPEG/PNG/WebP/PDF imzalarını (magic bytes) kabul edecek şekilde kısıtlandı, base64 fallback kaldırıldı ve görseller `sharp` ile 2000px `.webp`'ye dönüştürüldü. Yazı güncellemelerinde `slug` kalıcı hale getirildi ve eski slug'lar için `previous_slugs` → `permanentRedirect` desteği eklendi.
- **Güvenlik Başlıkları & Supabase RLS**: `next.config.ts` içine `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` ve `Content-Security-Policy` eklendi; `/admin` için `noindex` tanımlandı; `supabase/schema.sql` içine tüm tablolar için RLS politikaları işlendi.
- **Doğrulama**: `npm run lint` (`tsc --noEmit --incremental false`) ve `npm run build` 0 hata ile geçti. Yerel entegrasyon testleri (güvenlik başlıkları, `401` taslak gizliliği, taslak URL `404`, logout sonrası `401`, 10 hatalı girişte `429`, sahte SVG `400`, şifreli `enc:v1:` mesaj kaydı) başarıyla doğrulandı.
