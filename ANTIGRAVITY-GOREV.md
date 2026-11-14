# Büyük Akören Derneği sitesi: canlı teslim öncesi tam düzeltme görevi

Bu dosya senin (Antigravity ajanı) görev tanımındır. Baştan sona oku, sonra çalışmaya başla.

## 0. Bağlam ve çalışma kuralları

- Proje: `C:\Users\omerb\OneDrive\Desktop\büyük akören`. Next.js 16 (App Router), React 19, Tailwind 4, TypeScript. Veri katmanı `src/lib/store.ts` (Vercel Blob üzerinde JSON; Supabase desteği isteğe bağlı). Repo `github.com/bagcabey/buyukakoren`, `main` dalı Vercel'e otomatik yayınlanıyor: https://buyukakoren.vercel.app
- Site **yarın Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği'ne teslim edilecek.** Hiçbir alan demo, örnek ya da yer tutucu olarak kalmayacak.
- Ömer uyuyor. **Ondan onay isteme, soru sorma, durup bekleme.** Her adımda kendi muhakemeni yap. Adım bittiyse ve doğruladıysan sıradakine geç.
- **Sıralı çalış.** Aşağıdaki aşamaları sırayla yap. Her aşamanın sonunda "Aşama kontrolü"nü uygula. Kontrol geçmezse düzelt, tekrar kontrol et. Geçince commit at ve sıradaki aşamaya geç.
- `AGENTS.md` uyarısı geçerli: Bu Next.js sürümü eğitim verindekinden farklı. Kod yazmadan önce ilgili belgeyi `node_modules/next/dist/docs/` içinden oku. `@vercel/blob` için de `node_modules/@vercel/blob` tiplerine bak.
- **Geçici çözüm yasak.** Hatayı yutmak, sabit değer gömmek, testi atlamak, "şimdilik" ayarı yapmak yok. Sorunu kökünden çöz.
- **Bilgi uydurmak yasak.** Gerçek kurum verisini (IBAN, banka, telefon, e-posta, yönetim kurulu isimleri, muhtar adı, dernek kütük no, kuruluş tarihi) bilmiyorsan **uydurma ve yer tutucu yazma.** Bunun yerine:
  1. Alanı yönetici panelinden girilebilir yap.
  2. Alan boşsa sitede o bölümü **tamamen gizle**. "Panelden giriniz" gibi bir metin ziyaretçiye görünmesin.
  3. Eksik veriyi `TESLIM-ONCESI-EKSIKLER.md` dosyasına yaz: hangi bilgi, panelde nereye girilecek, kimden alınacak.
- **Yedek:** İlk iş `git tag yedek-teslim-oncesi-2026-11-14` ve `git push origin --tags`. `data/store.json` içinde commit edilmemiş yerel değişiklik var. Onu silme. Önce içeriğine bak, gerçek veri içeriyorsa koru.
- **Gizli değerleri** (şifre, token, anahtar) koda, README'ye, commit'e, sohbete yazma.
- **Commit düzeni:** Her aşama ayrı commit ve push. `npm run build` hatasız geçmeden push yok. Push'tan sonra Vercel dağıtımının tamamlandığını ve canlı sayfanın 200 döndüğünü doğrula.

### Her aşamanın kontrol listesi (Aşama kontrolü)
1. `npm run build` hatasız. TypeScript ve lint hatası yok.
2. `npm run dev` ile yerelde ilgili sayfaları tarayıcıda aç. Masaüstü (1440 px) ve mobil (390 px) ekran görüntüsü alıp kendin incele: taşma, üst üste binme, boş alan, kırık görsel, konsol hatası olmasın.
3. Admin panelden ilgili özelliği gerçekten kullan: ekle, düzenle, sil, sayfayı yenile. Kaydın kalıcı olduğunu gör.
4. Değişikliğin ilgisiz bir sayfayı bozmadığını ana sayfa, `/duyurular`, `/galeri` ve `/admin` üzerinden kontrol et.
5. Bulduğun ama bu aşamaya ait olmayan sorunu `CALISMA-GUNLUGU.md` dosyasına yaz, sırası gelince çöz.

Her aşamanın sonunda `CALISMA-GUNLUGU.md` dosyasına 3-5 satır yaz: ne yaptın, nasıl doğruladın, ne kaldı.

---

## Aşama 1: Güvenlik ve sistem hataları (önce bu, çünkü canlıda açık var)

Bunları ben (Claude) kodda ve canlıda tespit ettim. Sen göremiyor olabilirsin, hepsi gerçek:

1. **Varsayılan admin şifresi koda gömülü.** `src/lib/auth.ts` içinde `ADMIN_PASSWORD` yoksa `"Bakoren2026!"`, `ADMIN_SESSION_SECRET` yoksa sabit bir anahtar kullanılıyor. Aynı şifre `README.md` ve `.env.example` içinde de açıkça yazıyor.
   - Çözüm: Fallback'leri kaldır. Üretimde env yoksa giriş tamamen kapalı olsun ve sunucu loguna açık bir hata düşsün. README ve `.env.example` içinden gerçek şifreyi çıkar. Vercel'de bu iki değişkenin tanımlı olup olmadığını `vercel env ls` ile kontrol et. Tanımlı değilse güçlü rastgele değer üret, Vercel'e ekle (`vercel env add`). Değerin kendisini hiçbir yere yazma. Ömer'e nasıl öğreneceğini `TESLIM-ONCESI-EKSIKLER.md` içinde anlat.
2. **Oturum süresi doğrulanmıyor.** Token içindeki zaman damgası kontrol edilmiyor. Çerezi ele geçiren kişi sonsuza kadar admin kalıyor. Çıkış yapmak token'ı geçersiz kılmıyor.
   - Çözüm: Sunucu tarafında süre kontrolü (ör. 12 saat) ekle. Gizli anahtar değişince tüm oturumlar düşsün. `timingSafeEqual` uzunluk kontrolüyle doğru kullanılsın.
3. **Giriş denemesinde sınır yok** (kaba kuvvet saldırısına açık). İletişim formunda da spam koruması yok.
   - Çözüm: IP başına deneme sınırı ve gecikme ekle. Formda honeypot alanı, süre kontrolü ve uzunluk sınırları olsun.
4. **Taslaklar herkese açık.** `GET /api/posts` ve `GET /api/condolences` yayımlanmamış kayıtları da döndürüyor. `getPostBySlug` taslak yazıyı `/duyurular/[slug]` adresinde gösteriyor.
   - Çözüm: Herkese açık uçlar yalnız `is_published` kayıtları döndürsün. Admin verisi yetki kontrollü ayrı bir uçtan gelsin.
5. **İletişim mesajları (ad, telefon) herkese açık Blob dosyalarında** (`access: "public"`). Site durumu da public blob. Bu KVKK ihlali riski.
   - Çözüm: Kurulu `@vercel/blob` sürümü `access: "private"` destekliyorsa mesajları private sakla, admin sunucu tarafında okusun. Desteklemiyorsa kişisel veriyi bir veritabanına taşı (Supabase şeması `supabase/schema.sql` içinde hazır, RLS eksik, bkz. madde 8). Hangisini seçtiğini ve nedenini günlüğe yaz.
6. **Eşzamanlı yazmada veri kaybı.** `writeBlobStore` tüm durumu tek JSON olarak yazıyor. Serverless örnekleri arasında bellek içi `memoryStore` farklı. İki yönetici aynı anda kaydederse biri diğerini eziyor. Ayrıca 15'ten eski durum dosyaları siliniyor.
   - Çözüm: Kalıcı ve tutarlı bir depolama tasarla. Tercih: Supabase (Postgres) + RLS. Supabase bilgileri Vercel env'de yoksa Blob'da sürüm kontrollü yazma kullan (ETag veya `ifMatch` destekleniyorsa). Çakışmada kullanıcıya "içerik başka yerde değişti, yenileyin" uyarısı göster. Sessizce ezme olmasın. Okuma hatası da sessizce başlangıç verisine düşmesin.
7. **Dosya yüklemede doğrulama yok.** Tür ve boyut kontrolü yapılmıyor, uzantı kullanıcıdan alınıyor. SVG ya da HTML yüklenebiliyor. Blob yoksa base64 data URL veriye gömülüyor ve JSON şişiyor.
   - Çözüm: İzin verilen türler JPEG, PNG, WebP ve PDF olsun, MIME ve dosya imzası kontrol edilsin. Boyut sınırı koy (görsel 8 MB, PDF 15 MB). Görselleri sunucuda yeniden boyutlandır. Data URL yöntemini kaldır.
8. **`supabase/schema.sql` içinde RLS politikası yok.** Supabase'e geçilirse anon anahtarla tüm tablolar açık olur. Supabase kullanacaksan RLS'i aç ve politikaları yaz.
9. **Yerel ortam canlıya mesaj gönderiyor.** `createContactMessage`, yerelde çalışırken her mesajı `https://buyukakoren.vercel.app/api/contact` adresine iletiyor. Test mesajları gerçek kuruma düşer. Bu kodu kaldır.
10. **Slug düzenlemede değişiyor.** Yazı düzenlenince slug başlıktan yeniden üretiliyor, eski link kırılıyor ve aynı başlıklı iki yazı çakışabiliyor. Slug ilk oluşturulduğunda sabitlensin, benzersizliği kontrol edilsin, değiştirilirse eski adres yeni adrese 301 ile yönlensin.
11. **Supabase hataları yutuluyor.** `getAllStoreData` içinde `error` kontrolü yok. Hata loglansın, yöneticiye görünür olsun.
12. Güvenlik başlıkları ekle: CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy. Admin sayfasına `noindex` ekle.

**Aşama kontrolü ek:** Yanlış şifreyle 10 kez dene, sınırın devreye girdiğini gör. Çıkış yapıp eski çerezle `/api/settings` PUT dene, 401 gelmeli. Taslak bir yazının `/api/posts` ve slug adresinden görünmediğini kontrol et.

---

## Aşama 2: Yönetici paneli yetkinliği ve sayfa tasarımcısı

İstenen: **Yönetici her sayfayı baştan admin panelden tasarlayabilmeli.** Şu an panel yalnız duyuru, taziye, galeri, ayarlar ve mesaj yönetiyor. Ana sayfa, `/koyumuz`, `/dernek`, `/bagis` ve `/iletisim` metinleri, istatistikleri ve zaman çizelgesi kodun içine gömülü (`src/app/koyumuz/page.tsx` içindeki `POPULATION_HISTORY`, `TIMELINE`, `src/app/dernek/page.tsx` içindeki `ACTIVITY_AREAS`, ana sayfadaki "Sivas 62 km" gibi değerler).

Yapılacaklar:
1. **Blok tabanlı sayfa modeli:** `pages` koleksiyonu olsun. Her kayıtta slug, başlık, SEO başlığı, SEO açıklaması, OG görseli, yayın durumu, menüde gösterilsin mi, sıra ve `blocks[]` alanları bulunsun. Blok türleri: hero, zengin metin, görsel, görsel+metin, kart ızgarası, istatistik, zaman çizelgesi, galeri seçkisi, son duyurular, harekete geçirme düğmesi (CTA), SSS, iletişim kartı, harita, IBAN kartı, yönetim kurulu listesi.
2. Mevcut sabit sayfaları bu modele **taşı.** Bugünkü içerik ve görünüm birebir korunsun. Kod içindeki sabit veriler başlangıç (seed) verisi olsun.
3. **Panelde sayfa düzenleyici:** Blok ekleme, silme, yukarı/aşağı taşıma, çoğaltma, gizleme. Her bloğun alanları form olarak düzenlenebilsin. Görsel seçici galeri ve yüklemeyle çalışsın. Canlı önizleme ve taslak/yayın ayrımı olsun. **Sürüm geçmişi** tutulsun, eski sürüme dönülebilsin. Yeni sayfa oluşturulabilsin.
4. **Menü ve alt bilgi (footer) düzenleme:** Navbar, mobil alt menü ve footer bağlantıları panelden yönetilsin.
5. **Duyuru editörü:** Paragraf, başlık, liste, bağlantı, kalın yazı ve görsel ekleme olsun. HTML güvenli şekilde temizlensin (sanitize). Yayın tarihini ileri bir tarihe ayarlamak mümkün olsun.
6. **Yetki ve hesap:** Tek ortak şifre yerine kullanıcı tabanlı giriş olsun. Roller: `yonetici` her şeyi yapar, `editor` içerik ekler/düzenler, ayarlara ve kullanıcılara dokunamaz. Şifreler hash'li (bcrypt veya argon2) saklansın. Şifre değiştirme ekranı olsun. **İşlem günlüğü** tutulsun: kim, ne zaman, neyi değiştirdi.
7. **İçerik kontrol durumları:** Her içerik türünde taslak, yayında ve arşiv durumu olsun. Panelde "yayına almadan önce kontrol" listesi göster: görsel alt metni boş mu, SEO açıklaması boş mu, başlık uzunluğu uygun mu, kırık bağlantı var mı.
8. Panel ana ekranına **"Teslim öncesi eksikler"** kartı koy. IBAN, e-posta, telefon, yönetim kurulu ve muhtar gibi boş zorunlu alanları listelesin, her birine tıklayınca ilgili forma gitsin.

**Aşama kontrolü ek:** `/koyumuz` sayfasını panelden tamamen değiştir: blok ekle, sil, sırala, metni düzelt. Yayınla, ziyaretçi görünümünde doğrula, sonra eski sürüme geri dön.

---

## Aşama 3: Gerçek iletişim ve kurum bilgileri

Bunları resmî kaynaklarda doğruladım. Kullanırken kaynağı da yaz.

| Bilgi | Değer | Kaynak / durum |
|---|---|---|
| Resmî yazım | **Büyükakören** (köy), Yıldızeli / Sivas | Vikipedi, PTT |
| Posta kodu | **58502** | PTT kayıtları |
| Telefon alan kodu | 0346 | Vikipedi |
| Koordinat | 39°36′11″K 36°26′17″D (39.6031, 36.4381) | Vikipedi. Sitedeki harita linki doğru. |
| Rakım / yüzölçümü | 1276 m / 33,8 km² | Vikipedi |
| Uzaklık | Sivas 62 km, Yıldızeli 49 km | Vikipedi |
| Eski adlar | Ağören (1907), Büyük Akviran (1928) | Nişanyan Index Anatolicus (Vikipedi kaynağı) |
| Nüfus | 2021: 614 (Vikipedi). ADNKS 2024: 482, ADNKS 2025: 449 (237 erkek, 212 kadın) | 2024-2025 değerleri ikincil kaynaktan (nufusune.com). Sitede "Kaynak: TÜİK ADNKS" diye ver. Panelden güncellenebilir olsun. |
| Okul | **Büyük Akören Ortaokulu**, Büyük Akören Köyü Yıldızeli/SİVAS, Tel: **(0346) 753 11 22**, web: https://buyukakorenoo.meb.k12.tr | MEB resmî sitesi (son haber 24.04.2026) |
| Yıldızeli Kaymakamlığı | https://www.yildizeli.gov.tr | resmî |
| Sivas Valiliği | https://www.sivas.gov.tr | resmî |
| Muhtar | **Doğrulanamadı.** Kaymakamlığın eski listesinde Hasan Özüdoğru adı geçiyor, Muhtarlar Konfederasyonu'nun çok eski sayfasında Yaşar Kavaklı. İkisi de Mart 2024 seçiminden önceki kayıtlar. | **İsim ve telefonu siteye yazma.** Panelde "Muhtar adı" ve "Muhtarlık telefonu" alanları olsun. Boşsa muhtarlık kartı yalnız "Büyükakören Köyü Muhtarlığı – Yıldızeli/Sivas" ve kaymakamlık bağlantısını göstersin. Eksikler dosyasına yaz. |

Sitede düzeltilecek **yanlış veya yer tutucu bilgiler** (canlıda şu an görünüyor):
- `bilgi@buyukakoren.org`: Bu alan adı derneğe ait değil, e-posta çalışmıyor. Kaldır. Gerçek e-posta girilene kadar e-posta satırı ve "E-posta Gönder" düğmesi gizli kalsın.
- IBAN `TR00 0000 ...` ve banka "Yönetici Panelinden Banka Adı Giriniz": canlıda görünüyor. IBAN boşsa `/bagis` sayfasında IBAN kartı yerine "Bağış bilgileri yakında paylaşılacaktır, dernek yönetimiyle iletişime geçin" yazsın. IBAN alanına TR IBAN mod-97 doğrulaması ekle.
- Yönetim kurulu: "Yönetim Kurulu Üyesi (Panelden Düzenleyin)" kayıtları ziyaretçiye görünmesin. Yalnız gerçek isimler listelensin. Mustafa Tanju Çetiner'in başkan bilgisi mevcut içerikte var. Kaynağı belirsizse eksikler dosyasında "teyit edilecek" diye not düş.
- Örnek taziye ilanı ("Örnek Taziye İlanı (Yönetici Panelinden Düzenlenebilir)"): canlı veriden ve seed'den kaldır.
- `/koyumuz` içindeki "3 Mahalle • 3 Cami (Yukarı, Aşağı, Şeyhler Mahallesi; Merkez, Yeni, Şeyhler Camileri)" ve "1950–2000 dönemi" anlatısı **hiçbir resmî kaynakta doğrulanmadı.** Kaldır ya da panelden düzenlenebilir bloğa taşıyıp eksikler dosyasına "dernekten teyit edilecek" diye yaz. Doğrulanmamış bilgi kesinmiş gibi sunulmasın.
- "TÜİK verilerinden derlenen teyitli köy profili" ifadesi, kaynak gösterilmeden kullanılmasın. Her verinin yanına kaynak ve yıl yaz.
- Dernek kütük numarası, kuruluş yılı ve tüzük bilgisi şu an yok. Ayarlara alan olarak ekle, boşsa gizle, eksiklere yaz.

**Aşama kontrolü ek:** Canlı HTML'de `TR00`, `buyukakoren.org`, `Panelden`, `Örnek`, `yer tutucu`, `lorem` aramasını yap. Sonuç sıfır olmalı.

---

## Aşama 4: Resmiyet, KVKK ve yasal metinler

Site şu an yasal açıdan eksik: `/kvkk` ve `/gizlilik` 404 dönüyor, iletişim formu açık rıza veya aydınlatma olmadan ad ve telefon topluyor.

1. Şu sayfaları oluştur. Hepsi panelden düzenlenebilir ve footer'dan erişilebilir olsun:
   - **KVKK Aydınlatma Metni.** 6698 sayılı Kanun md. 10'a uygun olsun: veri sorumlusu (dernek unvanı, adres), işlenen veriler, amaç, hukuki sebep (md. 5), aktarım (Vercel/barındırma için yurt dışı aktarım, md. 9 değişikliği sonrası düzenleme), saklama süresi, md. 11 hakları, başvuru yolu.
   - **Gizlilik ve Çerez Politikası.** Yalnız zorunlu oturum çerezi kullanılıyorsa bunu açıkça yaz. Analitik eklersen çerez onay bandı zorunlu olur.
   - **Kullanım Koşulları** ve **Künye** (dernek unvanı, kütük no, adres, sorumlu kişi: panelden).
2. İletişim formuna aydınlatma metni bağlantısı ve "okudum" onay kutusu ekle. Gerekmeyen veri toplanmasın, telefon isteğe bağlı kalsın. Mesajlara saklama süresi koy (ör. 2 yıl sonra otomatik silinsin ya da panelde uyarı çıksın).
3. **Taziye ilanları** kişisel veri içerir. Yayın öncesi panelde "yakınların rızası alındı" onay kutusu olsun. İlanlar belirli süre sonra arşive alınabilsin.
4. **Görsellerde kişisel veri:** `public/images/koy/` içindeki `02_agac_dikim_temiz.jpg`, `03_koy_cocuklari_temizlik.jpg` ve `04_tarih_kultur_gezisi_iletisim.jpg` dosyalarında **yüzü tanınabilir çocuklar** var. Kaynakları da belirsiz (`gorseller/` klasöründeki ham adlar `05_meb_okul_koy_ham`, `06_google_thumb_ham`: biri MEB sitesinden, biri Google arama küçük resminden alınmış görünüyor, telif sorunu var).
   - Bu görsellerin dernekten izinli olduğu teyit edilene kadar: çocuk yüzlerini bulanıklaştırılmış sürümle değiştir **veya** aşağıdaki katalogdan uygun lisanslı görselle değiştir. Orijinalleri silme, `gorseller/izin-bekleyen/` klasörüne taşı.
   - MEB okul fotoğrafı ve Google küçük resmi için de aynısını yap. Eksikler dosyasına "dernekten fotoğraf izni/orijinal dosya istenecek" diye yaz.
5. Galeriye ve yazılara **görsel kaynak/lisans alanı** ekle (yazar, lisans, kaynak bağlantısı). CC BY ve CC BY-SA görsellerde atıf zorunlu. Galeri ışık kutusunda ve görsel altında küçük yazıyla göster.
6. Atatürk portresi: katalogdaki kamu malı yüksek çözünürlüklü portreyi kullan (bkz. Aşama 6). Atatürk ve Türk bayrağı kullanımı saygın ve oranlı olsun, bayrak resmî oranlarına (Türk Bayrağı Kanunu tüzüğü) uysun.
7. Site yazılımcısı bağlantısı: footer'da "Ömer Bağçabaşı" yazıyor, adres ise `omer-bahcebasi-protfolio-...`. Bağlantıyı değiştirme, yalnız eksikler dosyasına "isim ve adres yazımı teyit edilsin" diye not düş.

---

## Aşama 5: Büyük Akören odaklı SEO

1. **Sayfa başına metadata:** Her sayfada benzersiz `title` (≤60 karakter) ve `description` (≤155 karakter), `alternates.canonical`, Open Graph ve Twitter kartı olsun. Şu an yalnız kök layout ve duyuru detayında var. Değerler panelden yönetilsin (Aşama 2'deki SEO alanları).
2. **Anahtar ifadeler** (doğal kullan, doldurma yapma): "Büyükakören köyü", "Büyük Akören", "Büyükakören Yıldızeli", "Sivas Yıldızeli köyleri", "Büyükakören köyü derneği", "Büyükakören taziye", "Büyükakören vefat ilanları", "Büyükakören posta kodu 58502", "Büyükakören nüfusu", "Büyük Akören Ortaokulu". İki yazım biçimi (bitişik ve ayrı) başlıklarda ve metinde birlikte geçsin.
3. **Yapısal veri (JSON-LD):** Ana sayfada `Organization` (NGO) ve `WebSite`, köy sayfasında `Place` (geo, adres, posta kodu 58502), duyurularda `NewsArticle`, iletişimde `ContactPage`, bütün sayfalarda `BreadcrumbList`. Rich Results Test mantığıyla geçerli olsun. Boş alan (ör. telefon) JSON-LD'ye girmesin.
4. **İçerik derinliği:** `/koyumuz` sayfası doğrulanmış verilerle zenginleşsin: konum, ulaşım (Sivas'tan ve Yıldızeli'den nasıl gidilir), nüfus tablosu kaynaklı, eski adlar, okul, iklim, Sivas ve Yıldızeli kültürel çevresi (katalog görselleriyle). Her bölümde kaynak gösterilsin.
5. **Teknik:** OG görseli oluştur (1200×630, `opengraph-image` dosya kuralı ile), `manifest`, uygun boyutlarda favicon ve apple-touch-icon olsun. `sitemap.ts` içinde `lastModified` gerçek güncelleme tarihi olsun, her istekte `now` olmasın. Taziye ve galeri sayfaları sitemap'te kalsın, admin ve api dışarıda kalsın. `metadataBase` ve sitemap/robots içindeki alan adı tek bir env değişkeninden (`NEXT_PUBLIC_SITE_URL`) gelsin, özel alan adı alınınca tek yerden değişsin.
6. **Performans:** `images.unoptimized: true` kapatılsın, `next/image` kullanılsın (Blob alan adı `remotePatterns`'e eklensin). Görseller WebP/AVIF ve doğru `sizes` ile sunulsun. Kök layout'taki `force-dynamic` her sayfayı dinamik yapıyor; ISR/`revalidate` ve panelden kayıtta `revalidatePath` ile statik + tazelenen yapıya geç. Lighthouse mobil hedefi: Performans ≥ 90, SEO 100, Erişilebilirlik ≥ 95.
7. **Erişilebilirlik:** Alt metinler anlamlı olsun, renk kontrastı uygun olsun, klavye ile gezilebilsin, `lang="tr"` kalsın, başlık hiyerarşisi tek H1 olsun.

---

## Aşama 6: Görsel kataloğu kullan

Senin bulamadığın görselleri ben topladım. Hepsi Wikimedia Commons'tan, lisansı serbest (CC0, kamu malı, CC BY, CC BY-SA):

- **Klasör:** `C:\Users\omerb\OneDrive\Desktop\büyük akören\gorsel-katalog\`
- **Açıklamalar:** Aynı klasördeki `KATALOG.md` (okunur liste) ve `katalog.json` (makine okunur). Her görsel için dosya yolu, ad, açıklama metni, önerilen kullanım yeri, lisans, yazar ve kaynak sayfası var. Dosyalar klasör ve isme göre sıralı.
- Alt klasörler: `01-koy-cevresi` (köye 7-10 km mesafedeki çevre fotoğrafları), `02-yildizeli-ilcesi`, `03-sivas-tarih-kultur` (kültür gezisi haberinde geçen Kongre Müzesi, Buruciye, Çifte Minareli, Şifaiye ve Gök Medrese), `04-kirsal-yasam-tarim`, `05-ataturk-ve-milli`.
- **Önemli:** Commons'ta doğrudan **Büyükakören köyünün** serbest lisanslı fotoğrafı yok. Katalogdaki çevre görsellerini "köyün kendisi" gibi sunma. Açıklamalarda "Yıldızeli bölgesi", "Sivas" gibi doğru ifadeyi kullan. Köyün gerçek fotoğrafları dernekten gelecek; eksikler dosyasına yaz.

Yapılacaklar:
1. Kullanacağın görselleri `public/images/katalog/...` altına kopyala (WebP'ye çevir, en uzun kenar 2000 px). Galeriye ilgili albümlerle ekle: "Yıldızeli ve Çevresi", "Sivas Tarih ve Kültür", "Kırsal Yaşam". Seed ve canlı veride de olsun.
2. Her kullanımda `katalog.json` içindeki yazar, lisans ve kaynak bilgisiyle **atıf** göster (Aşama 4 madde 5).
3. Kültür gezisi duyurusuna Sivas görsellerini, köy sayfasına çevre ve tarım görsellerini, milli gün içeriklerine Kongre Müzesi ve Atatürk görsellerini yerleştir.
4. Navbar'daki 250 px Atatürk portresini `05-ataturk-ve-milli/01_ataturk_portre_yuksek_cozunurluk.jpg` ile değiştir (uygun boyutta, keskin).

---

## Aşama 7: Tasarım hataları

Her sayfayı 390, 768, 1024 ve 1440 px genişlikte ekran görüntüsü alarak incele ve düzelt. Özellikle bak:
- Düşük çözünürlüklü görseller büyük alanda bulanık mı (`01_koy_panoramik.jpg` 670×335, `06_koy_kis_manzarasi.jpg` 510×602 ama geniş alanlarda kullanılıyor). Uygun katalog görseliyle değiştir ya da alanı görselin boyutuna göre düzenle.
- Boş durumlar: duyuru, taziye ya da galeri boşken sayfa düzgün görünüyor mu.
- Mobil alt menü (`MobileBottomNav`) içeriğin ve footer'ın üstüne biniyor mu.
- Uzun Türkçe başlıklar ve dernek unvanı satır kırılımında taşıyor mu.
- Kırmızı üst kuşak, Atatürk portresi ve bayrak oranları ile hizası tutarlı mı.
- Odak halkaları, hover durumları, düğme boyutları (dokunma alanı ≥ 44 px) uygun mu.
- `loading.tsx` ve `not-found.tsx` kurumsal görünümde mi.
- Yazdırma görünümü: taziye ilanı ve duyuru yazdırılabilir olsun.

Mevcut renk paletini (#191919, #666560, #e6e5e0, #fbfbfa, #1f4d36 ve kırmızı kuşak) ve tipografiyi (Inter, Plus Jakarta Sans) koru. Yeni bir tasarım dili icat etme, var olanı düzelt ve tutarlı hale getir.

---

## Aşama 8: Google tanıtımı

1. Google Search Console doğrulaması zaten var (`public/google5cdf4f27709d4a0f.html` ve metadata). Tarayıcıda Ömer'in açık Google oturumu varsa Search Console'da `https://buyukakoren.vercel.app/sitemap.xml` adresini gönder, önemli sayfalar için URL denetimi ve dizine ekleme isteği yap. **Şifre girme.** Oturum yoksa adımları eksikler dosyasına yaz.
2. Bing Webmaster Tools için IndexNow anahtar dosyası ekle ve yayında duyuru eklendiğinde IndexNow'a bildirim gönderen yapıyı kur (ücretsiz, oturum gerektirmez).
3. **Google İşletme Profili:** Hesap ve doğrulama derneğin yetkilisiyle yapılacak. Kurma, sadece `GOOGLE-TANITIM-REHBERI.md` hazırla: kategori önerisi ("Kar amacı gütmeyen kuruluş" ya da "Dernek"), açıklama metni (750 karakter), hizmet alanı (Büyükakören, Yıldızeli, Sivas), eklenecek fotoğraflar, doğrulama adımları.
4. Sosyal paylaşım: Her duyuruda WhatsApp ve Facebook paylaşım düğmesi doğru OG görseliyle çalışsın. WhatsApp paylaşımını gerçek bir duyuru linkiyle test et (OG önizleme).
5. `GOOGLE-TANITIM-REHBERI.md` içine ilk 30 günlük içerik planı yaz: hangi duyurular, taziye kullanımı, galeri güncellemesi, köy tanıtım yazıları (ör. "Büyükakören köyüne nasıl gidilir", "Büyükakören'in tarihçesi ve eski adları").

---

## Aşama 9: Son denetim ve teslim raporu

1. Canlı sitede tüm sayfaları gez, her bağlantıya tıkla, kırık link olmasın. Konsol hatası olmasın. Lighthouse mobil ve masaüstü raporlarını `teslim-raporu/` klasörüne kaydet.
2. Admin panelinde tüm akışları baştan sona dene: giriş, sayfa düzenleme, duyuru, taziye, galeri yükleme, ayarlar, mesaj okuma ve silme, çıkış.
3. Aşama 3'teki yer tutucu metin aramasını canlıda tekrarla.
4. `TESLIM-RAPORU.md` yaz: ne yapıldı, nasıl doğrulandı, ne yapılamadı ve neden, derneğin girmesi gereken bilgiler (`TESLIM-ONCESI-EKSIKLER.md` özeti), yönetici kullanım kılavuzu (kısa, ekran adımlarıyla).
5. Hepsi bitince son commit ve push. Canlı dağıtımı doğrula.

Takılırsan durma. Sorunu ve denediklerini `CALISMA-GUNLUGU.md` dosyasına yaz, o maddeyi en doğru şekilde çözmeye devam et. Çözülemiyorsa sıradaki maddeye geç ve sonda tekrar dön.
