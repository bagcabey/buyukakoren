# Teslim Raporu ve Dernek Yöneticisi Kullanım Kılavuzu

**Proje:** Sivas Yıldızeli Büyük Akören (Büyükakören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği Web Portalı  
**Canlı Adres:** https://buyukakoren.vercel.app  
**Kaynak Depo:** https://github.com/bagcabey/buyukakoren  
**Teslim Tarihi:** 14 Kasım 2026  

---

## 1. Yönetici Özeti — Tamamlanan Aşamalar (Aşama 0 – Aşama 9)

Bu çalışma boyunca web portalı uçtan uca güvenlik, veri bütünlüğü, KVKK uyumu, SEO, erişilebilirlik, görsel lisans doğruluğu ve canlı üretim kalitesi açısından 9 aşamada gözden geçirilip doğrulanmıştır:

| Aşama | Kapsam | Öne Çıkan Çıktılar |
| :--- | :--- | :--- |
| **Aşama 0** | Yedekleme ve Ortam Hazırlığı | `yedek-teslim-oncesi-2026-11-14` Git etiketi oluşturuldu; `package.json` `tsc --noEmit` tip kontrolüne geçirildi. |
| **Aşama 1** | Güvenlik ve Sistem Hataları | Sabit şifre/gizli anahtar fallback'leri kaldırıldı (`503` fail-closed); HMAC-SHA256 + sunucu taraflı oturum iptal listesi, girişte 5 hatalı denemede 15 dk kilit (`429`), iletişim formunda honeypot/hız sınırı, `AES-256-GCM` şifreli mesaj ve `scrypt` parola saklama, `409 Conflict` sürüm kilidi, magic-byte dosya doğrulama (`/api/upload`), `X-Frame-Options`/`CSP` güvenlik başlıkları ve kalıcı slug + `308` yönlendirme devreye alındı. |
| **Aşama 2** | Admin Paneli ve Sayfa Tasarımcısı | 15 blok türüyle görsel **Sayfa Tasarımcısı**, son 10 sürüm üzerinden **Revizyon Geri Yükleme**, `Menü & Alt Bilgi` yöneticisi, `yonetici`/`editor` rol ayrımı, Markdown kısayol çubuğu, taslak/planlı yayın ve taziye aile rıza zorunluluğu eklendi. |
| **Aşama 3** | Gerçek Kurum ve İletişim Temizliği | Tüm `TR00` IBAN, `buyukakoren.org`, `"Panelden"`, `"Örnek"` ve deneme metinleri temizlendi; doğrulanamayan bilgiler ziyaretçilere otomatik gizlenecek şekilde ayarlandı ve `TESLIM-ONCESI-EKSIKLER.md` oluşturuldu. |
| **Aşama 4** | KVKK ve Yasal Uyum | Düzenlenebilir `/kvkk`, `/gizlilik`, `/kullanim-kosullari` ve `/kunye` sayfaları eklendi; iletişim ve taziye akışları rıza onayına bağlandı; yüzü tanınabilir/izni belirsiz yerel görseller silinmeden `gorseller/izin-bekleyen/` altına ayrıldı. |
| **Aşama 5** | Büyük Akören SEO ve Performans | `NGO`/`WebSite`/`Place`/`NewsArticle`/`ContactPage`/`BreadcrumbList` JSON-LD verileri, kanonik URL'ler, `/opengraph-image`, `/apple-icon`, `/manifest.webmanifest`, `/sitemap.xml` (5 dk ISR), `revalidate = 60` + `revalidatePath` önbellek tazeleme ve AVIF/WebP `next/image` optimizasyonu eklendi. |
| **Aşama 6** | 31 Lisanslı Görsel Kataloğu | `gorsel-katalog/` içindeki 31 Wikimedia Commons fotoğrafı ≤ 2000 px WebP'ye dönüştürülüp `public/images/katalog/` ve `src/lib/katalog.ts` üzerinden tam yazar/lisans/kaynak URL atfıyla yayınlandı; Atatürk üst kuşak portresi 240×240 yüksek çözünürlüklü sürümle yenilendi. |
| **Aşama 7** | Tasarım, Baskı, Mobil ve Erişilebilirlik | `:focus-visible` kırmızı odak halkası, 44×44 px dokunma hedefleri, `@media print` kurumsal baskı stili, `not-found.tsx` ve 10 rota × 4 genişlikte (390/768/1024/1440 px) taşmasız mobil doğrulama tamamlandı (18 ekran görüntüsü: `teslim-raporu/ekran-goruntuleri/`). |
| **Aşama 8** | Google Tanıtım, IndexNow ve Paylaşım | `/b8a58502buyukakoren2026indexnow.txt` ve yazı yayımında otomatik `notifyIndexNow`, WhatsApp/Facebook/X/Kopyala/Yazdır paylaşım çubuğu (`ShareButtons.tsx`) ve `GOOGLE-TANITIM-REHBERI.md` hazırlandı. |
| **Aşama 9** | Son Canlı Denetim, Lighthouse ve Rapor | Vercel ISR kök rota (`/index`) `usePathname` hidrasyon hatası (`React #418`) giderildi (`Navbar.tsx`, `MobileBottomNav.tsx`); 27 URL taraması, 13 rota canlı Chromium konsol testi, 8 adımlı uçtan uca Admin E2E testi ve Mobil/Masaüstü Lighthouse ölçümleri tamamlandı. |

---

## 2. Doğrulama ve Ölçüm Sonuçları

### 2.1. Canlı Site Denetimi (`https://buyukakoren.vercel.app`)
- **HTTP ve Bağlantı Taraması (`stage9-full-audit.mjs`):**
  - Site haritası, tüm sayfa rotaları, duyuru detay sayfaları, `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/apple-icon`, `/manifest.webmanifest`, `/b8a58502buyukakoren2026indexnow.txt`, `/google5cdf4f27709d4a0f.html` ve `/admin` dahil **27 uç nokta** `200 OK` döndü.
  - Sayfalardan keşfedilen **24 dahili bağlantı ve görsel** `200 OK` döndü.
  - Ziyaretçi HTML çıktılarında yasaklı yer tutucu/test kalıntısı bulunmadı (`0` eşleşme).
  - Yetkisiz API erişim denetimi: `GET /api/posts` = `200`; oturumsuz `GET /api/posts?all=1`, `GET /api/audit`, `GET /api/contact` = `401 Unauthorized`.
- **Tarayıcı Konsol ve Görsel Kontrolü (`live-browser-check.py`):**
  - 13 genel rota (`/`, `/koyumuz`, `/dernek`, `/duyurular`, `/faaliyetler`, `/taziye`, `/galeri`, `/bagis`, `/iletisim`, `/kvkk`, `/gizlilik`, `/kullanim-kosullari`, `/kunye`) gerçek headless Chromium ile gezildi: **0 `console.error`, 0 `pageerror` (React hidrasyon hatası dahil tamamen giderildi), 0 kırık görsel (`naturalWidth === 0`)**.
- **Çoklu Ekran Genişliği Ekran Görüntüleri (`teslim-raporu/ekran-goruntuleri/`):**
  - `390px`, `768px`, `1024px`, `1440px` genişliklerinde 40 görünüm test edildi; `0` yatay taşma doğrulandı. Kayıtlı örnekler: `ana-sayfa-{390,768,1024,1440}px.png`, `koyumuz-{390,768,1024,1440}px.png`, `galeri-{390,768,1024,1440}px.png`, `duyurular-{390,1440}px.png`, `iletisim-{390,1440}px.png`, `taziye-{390,1440}px.png`.

### 2.2. Yönetici Paneli Uçtan Uca E2E Testi (`test-admin-e2e.py`)
Yerel üretim sunucusu (`next start`) üzerinde yalıtılmış geçici veri kopyasıyla 8 akışın tamamı tarayıcıdan doğrulanmıştır:
1. `/admin` giriş doğrulaması
2. **Sayfa Tasarımcısı** kaydetme ve revizyon geçmişi oluşturma
3. **Duyuru** oluşturma → `/duyurular` genel sayfasında görünüm doğrulaması → düzenleme → silme
4. **Taziye** ilanı (aile rızası onayıyla) oluşturma → `/taziye` sayfasında görünüm doğrulaması → silme
5. **Galeri** gerçek görsel dosyası yükleme (`sharp` WebP dönüşümü) + lisans girişi → kaydetme → silme
6. **Genel Ayarlar** kaydetme
7. **İletişim Formu** (`/iletisim`, KVKK rızası + bot koruması) gönderimi → `/admin` **Gelen Mesajlar** sekmesinde şifre çözülerek okuma → `Okundu İşaretle` → silme
8. **Güvenli Çıkış** sonrası giriş ekranına dönüş ve `/api/audit` için `401` kontrolü

### 2.3. Lighthouse Performans ve Kalite Raporları
Rapor JSON dosyaları depoda saklanmıştır: [lighthouse-mobile.json](./teslim-raporu/lighthouse-mobile.json) ve [lighthouse-desktop.json](./teslim-raporu/lighthouse-desktop.json).

| Kategori | Mobil Puan | Masaüstü Puan |
| :--- | :---: | :---: |
| **Performance (Performans)** | **94 / 100** | **100 / 100** |
| **Accessibility (Erişilebilirlik)** | **96 / 100** | **96 / 100** |
| **Best Practices (En İyi Uygulamalar)** | **100 / 100** | **100 / 100** |
| **SEO** | **100 / 100** | **100 / 100** |

Temel metrikler:
- **Mobil:** FCP `1.0 s`, LCP `3.0 s`, TBT `120 ms`, CLS `0`, Speed Index `1.8 s`
- **Masaüstü:** FCP `0.4 s`, LCP `0.7 s`, TBT `0 ms`, CLS `0`, Speed Index `0.6 s`

---

## 3. Otomatik Tamamlanmayan ve Kurum Onayı Bekleyen Maddeler

Tüm ayrıntılı kontrol listesi [TESLIM-ONCESI-EKSIKLER.md](./TESLIM-ONCESI-EKSIKLER.md) ve Google tanıtım adımları [GOOGLE-TANITIM-REHBERI.md](./GOOGLE-TANITIM-REHBERI.md) dosyalarındadır. Özetle:

1. **Vercel Ortam Değişkenleri:** `ADMIN_PASSWORD` (en az 12 karakter, güçlü) ve `ADMIN_SESSION_SECRET` (32+ karakter) Vercel Dashboard → Project Settings → Environment Variables bölümüne eklenmelidir *(yerel Vercel CLI oturumu kapalı olduğu için uzaktan eklenmemiştir)*.
2. **Gerçek Dernek Kurum ve İletişim Verileri:** Resmî banka hesap adı + 26 haneli `TR` IBAN, resmî dernek telefonu/e-postası, DERBİS kütük numarası, vergi dairesi, kuruluş yılı, güncel dönem köy muhtarı adı/telefonu, Dernek Başkanı **Mustafa Tanju Çetiner** görevi ile yönetim kurulu listesi, sosyal medya hesapları ve varsa doğrulanan mahalle/cami sayısı dernek yönetimi tarafından teyit edilip `/admin` üzerinden girilmelidir *(boş bırakılan alanlar sitede otomatik gizlidir)*. Footer'daki site yazılımcısı portfolyo adresi ve soyadı yazımı teslim öncesi son kez kontrol edilmelidir.
3. **Doğrudan Köy İçi Fotoğrafları:** Yüzü tanınabilir/izni belirsiz eski fotoğraflar silinmeden [gorseller/izin-bekleyen/](./gorseller/izin-bekleyen/) klasörüne ayrılmıştır; dernekten açık yayın izniyle yüksek çözünürlüklü okul, cami, çeşme, mahalle ve etkinlik fotoğrafları alındığında `/admin` → **Galeri** üzerinden eklenmelidir.
4. **Google Search Console ve Google İşletme Profili:** Google hesap oturumu gerektirdiği için Search Console'da `sitemap.xml` gönderimi/URL denetimi ve `business.google.com` doğrulaması yetkili Google hesabıyla tamamlanmalıdır.

---

## 4. Dernek Yöneticisi Kullanım Kılavuzu

Bu bölüm teknik bilgisi olmayan dernek yöneticilerinin siteyi güvenle yönetebilmesi için hazırlanmıştır.

### 4.1. Yönetim Paneline Giriş (`/admin`)
1. Tarayıcıda `https://buyukakoren.vercel.app/admin` adresine gidin.
2. Kullanıcı adınızı (varsayılan ilk kurulumda `admin` veya tanımlanan editör kullanıcı adı) ve dernek yöneticisi şifrenizi girip **Giriş Yap** düğmesine basın.
3. **Güvenlik Notu:** Arka arkaya 5 kez hatalı şifre girilirse hesap güvenliği için sistem 15 dakika bekleme uygular. İşiniz bittiğinde mutlaka sağ üstteki **Çıkış Yap** düğmesine basın.

### 4.2. Duyuru, Haber ve Faaliyet Ekleme / Düzenleme
1. Üst sekmeden **Duyuru, Haber & Faaliyet** bölümünü açın.
2. **İçerik Türü / Kategori** listesinden `Duyuru`, `Haber`, `Resmî Açıklama`, `Faaliyet Raporu` veya **`+ Yeni Kategori`** ile özel bir kategori seçin. *Faaliyet Raporu* seçerseniz proje durumunu (`Planlandı`, `Devam Ediyor`, `Tamamlandı`) belirleyebilirsiniz.
3. **Başlık**, **Kısa Özet** ve **Detaylı İçerik** alanlarını doldurun. Metin biçimlendirme için düzenleyici üzerindeki **H2**, **H3**, **Kalın**, **İtalik**, **Liste** ve **Link** düğmelerini kullanabilirsiniz.
4. **Görsel ve Belge Ekleme:**
   - **Yükle** düğmesiyle bilgisayardan veya telefondan JPEG/PNG/WebP fotoğraf (sistem otomatik optimize WebP'ye çevirir) ya da PDF karar/faaliyet raporu yükleyebilirsiniz.
   - Çoklu fotoğraf eklemek için **Ek Galeri Görselleri** alanını, telif güvenliği için **Görsel Alt Açıklaması**, **Görsel Sahibi / Yazar**, **Lisans** ve **Kaynak URL** kutularını doldurun.
5. **Yayın Durumu:** Hemen yayına almak için **Yayında** seçili bırakıp **Kaydet ve Yayınla**'ya basın. Henüz yayınlamayacaksanız **Taslak** seçebilir veya **Planlanan Yayın Tarihi** girebilirsiniz.
6. Yayınlanan duyuruyu WhatsApp gruplarında paylaşmak için duyuru sayfasını açıp **WhatsApp** veya **Bağlantıyı Kopyala** düğmesine basmanız yeterlidir.

### 4.3. Taziye İlanı Yayınlama
1. **Taziye İlanları** sekmesine geçin.
2. Merhum / merhumenin adını, cenaze vakti ve defin yerini yazın.
3. **Zorunlu KVKK Adımı:** Ailenin bilgisi ve onayı olmadan taziye ilanı yayınlanmaması için **Merhum/merhume yakınlarının açık rızası alındı (Zorunlu)** kutusunu işaretleyin.
4. **Taziye İlanını Yayınla**'ya basın. Süresi geçen ilanları silmeden gizlemek isterseniz kart üzerindeki **Göz (Gizle/Yayınla)** simgesine tıklayabilirsiniz.

### 4.4. Fotoğraf Galerisi Yönetimi
1. **Galeri** sekmesini açın.
2. **Fotoğraf Başlığı** girin, sağdan albüm seçin (veya **Yeni Kategori** ekleyin) ve **Yükle** ile fotoğrafı yükleyin.
3. Özellikle üçüncü kişilere veya açık kaynaklara ait karelerde **Görsel Alt Metni**, **Yazar / Çeken Kişi**, **Lisans** ve **Kaynak URL** alanlarını doldurup **Galeriye Ekle** düğmesine basın.

### 4.5. Sayfa Tasarımcısı (`Sayfa Tasarımcısı`) ve Geri Alma
Ana sayfa (`/`), Köyümüz (`/koyumuz`), Derneğimiz (`/dernek`), Bağış (`/bagis`), İletişim (`/iletisim`), Yasal sayfalar (`/kvkk`, `/gizlilik`, `/kullanim-kosullari`, `/kunye`) veya yeni açacağınız özel sayfaların tüm bölümlerini kod yazmadan düzenleyebilirsiniz:
1. **Sayfa Tasarımcısı** sekmesine geçin, soldan düzenlemek istediğiniz sayfayı seçin (veya **Yeni Sayfa Ekle** ile yeni bir sayfa oluşturun).
2. Sayfa içindeki blokları yukarı/aşağı oklarla sıralayın, geçici olarak gizlemek için göz simgesine basın veya **Blok Ekle** ile yeni bölüm ekleyin.
3. Düzenleme bitince sağ üstteki **Sayfayı Kaydet** düğmesine basın.
4. Hatalı bir düzenleme yaptıysanız sol alt bölümdeki **Son Revizyonlar** listesinden eski bir kaydın yanındaki **Geri Yükle** düğmesiyle önceki sürüme dönebilirsiniz.

### 4.6. Menü, Üst Atatürk Kuşağı, Genel Ayarlar ve IBAN
- **Menü & Alt Bilgi (Yönetici rolü):** Üst menü linklerinin sırasını ve görünürlüğünü, sayfanın en üstündeki kırmızı Atatürk/Türk Bayrağı kuşağının metnini ve görünürlüğünü, footer açıklamasını ve sosyal medya linklerini düzenleyin.
- **Ayarlar & Yönetim (Yönetici rolü):**
  - Resmî telefon, e-posta, muhtar bilgisi, banka adı, hesap sahibi ve **TR IBAN** bilgisini buradan girin.
  - Sistem 26 haneli `TR` IBAN üzerinde matematiksel doğrulama (Mod-97) yapar; hatalı rakam girilirse kaydetmeyi durdurup sizi uyarır.
  - Boş bıraktığınız alanlar ziyaretçi sayfalarında gizlenir.

### 4.7. Gelen Mesajlar ve Kullanıcı / İşlem Kaydı
- **Gelen Mesajlar:** `/iletisim` formundan gelen tüm mesajlar sunucuda `AES-256-GCM` ile şifrelenerek saklanır ve yalnız giriş yapmış yetkililere gösterilir. Okuduğunuz mesajları **Okundu İşaretle** ile işaretleyebilir, işi bitenleri silebilirsiniz.
- **Kullanıcılar & İşlem Kaydı:** Her kullanıcı buradan kendi şifresini güncelleyebilir. Yalnızca **Yönetici** yetkisine sahip kişi yeni **Editör** (içerik ekleme/düzenleme) veya **Yönetici** hesabı oluşturabilir ve tüm değişiklik kayıtlarını (**İşlem Günlüğü**) inceleyebilir.
