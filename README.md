# Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği Web Portalı

Bu proje, Sivas ili Yıldızeli ilçesine bağlı Büyükakören (Büyük Akören) Köyü ve derneği için geliştirilmiş resmî kurumsal bilgi, duyuru, faaliyet, galeri, taziye ve iletişim portalıdır.

## Kurulum ve Geliştirme

```bash
npm install
npm run dev
```

Tarayıcıdan `http://localhost:3000` adresini açın.

## Ortam Değişkenleri

Yerel geliştirme için `.env.example` dosyasını `.env.local` olarak kopyalayıp kendi güçlü gizli değerlerinizi girin:

```env
ADMIN_PASSWORD=<en-az-12-karakter-guclu-sifre>
ADMIN_SESSION_SECRET=<en-az-32-karakter-rastgele-anahtar>
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Güvenlik Notu:** Üretim ortamında (`Vercel → Project Settings → Environment Variables`) `ADMIN_PASSWORD` ve `ADMIN_SESSION_SECRET` değerlerini mutlaka tanımlayın. Varsayılan veya zayıf şifreler sistem tarafından kabul edilmez.

## Kalıcı Veri Depolama

- Üretimde Vercel Blob (`BLOB_READ_WRITE_TOKEN`) üzerinden atomik sürüm kontrollü CMS verisi (`store/state-v2.json`) ve AES-256-GCM ile şifrelenmiş özel veri depoları (`store/private/`) kullanılır.
- Yerel geliştirme ortamında veriler `data/store.json` ve şifreli `data/security.enc.json` / `data/messages.enc.json` dosyalarında saklanır.
- İstenirse `supabase/schema.sql` ile Satır Düzeyi Güvenlik (RLS) etkin Supabase PostgreSQL altyapısı da kullanılabilir.

## Komutlar

- `npm run lint`: TypeScript tür denetimi (`tsc --noEmit`)
- `npm run build`: Üretim derlemesi
- `npm run start`: Üretim sunucusu
