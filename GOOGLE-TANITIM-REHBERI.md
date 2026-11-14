# Google Tanıtım ve Görünürlük Rehberi — Büyük Akören Köyü Derneği

Bu rehber; **Sivas Yıldızeli Büyük Akören (Büyükakören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği** web portalının (`https://buyukakoren.vercel.app`) Google, Bing ve sosyal ağlarda hızlı ve doğru dizine alınması için hazırlanmıştır.

---

## 1. Google Search Console (Site Haritası ve URL Denetimi)

Sitenin sahiplik doğrulaması kod tarafında (`public/google5cdf4f27709d4a0f.html` ve `<meta name="google-site-verification" content="5cdf4f27709d4a0f" />`) halihazırda eklenmiştir.

### Yapılacak Adımlar (Yönetici / Ömer Google Oturumuyla)
1. **Google Search Console**'a giriş yapın: `https://search.google.com/search-console`
2. Mülk olarak `https://buyukakoren.vercel.app/` adresini seçin (**Doğrula**).
3. Sol menüden **Site Haritaları (Sitemaps)** bölümüne tıklayın.
4. Yeni site haritası ekle alanına yalnızca şu uzantıyı yazıp **Gönder** butonuna basın:
   - `sitemap.xml` (tam URL: `https://buyukakoren.vercel.app/sitemap.xml`)
5. Üst arama çubuğundaki **URL Denetimi** ile aşağıdaki temel sayfalar için **"Dizine Eklenmesini İste (Request Indexing)"** işlemini uygulayın:
   - `https://buyukakoren.vercel.app/`
   - `https://buyukakoren.vercel.app/koyumuz`
   - `https://buyukakoren.vercel.app/dernek`
   - `https://buyukakoren.vercel.app/duyurular`
   - `https://buyukakoren.vercel.app/faaliyetler`
   - `https://buyukakoren.vercel.app/taziye`
   - `https://buyukakoren.vercel.app/galeri`
   - `https://buyukakoren.vercel.app/iletisim`

---

## 2. Bing Webmaster Tools ve Otomatik IndexNow

Portalda Bing, Yandex ve IndexNow destekli arama motorları için otomatik bildirim altyapısı aktiftir:
- Doğrulama anahtar dosyası: `https://buyukakoren.vercel.app/b8a58502buyukakoren2026indexnow.txt`
- Yönetici panelinden yeni bir duyuru/haber yayımlandığında veya güncellendiğinde sunucu otomatik olarak `api.indexnow.org/indexnow` uç noktasına sayfanın tam URL'sini, ana sayfayı, `/duyurular`, `/faaliyetler` ve `/sitemap.xml` yollarını bildirir.
- Ek olarak `https://www.bing.com/webmasters` üzerinden Google Search Console hesabını bağlayarak site haritasını tek tıkla Bing'e de aktarabilirsiniz.

---

## 3. Google İşletme Profili (Google Business Profile) Kurulum Rehberi

Google Haritalar ve Google Arama'da `"Büyük Akören Köyü Derneği"` aramalarında sağ bilgi kartının çıkması için dernek yetkilisi tarafından açılmalıdır:

1. **Adres:** `https://business.google.com` → **İşletmenizi ekleyin**
2. **İşletme Adı:** `Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği`
3. **Ana Kategori:** `Kâr amacı gütmeyen kuruluş` *(veya Türkçe arayüzde çıkan en yakın seçenek: `Dernek veya kuruluş` / `Sivil toplum kuruluşu`)*
4. **Konum / Hizmet Alanı:**
   - Fiziksel merkez doğrulaması dernek merkezi adresine göre yapılır; köy hizmet alanı olarak şu bölgeleri ekleyin:
     - `Büyükakören, Yıldızeli/Sivas`
     - `Yıldızeli, Sivas`
     - `Sivas Merkez, Sivas`
     - `Posta Kodu: 58502`
5. **Hazır Tanıtım Metni (722 karakter — kopyalayıp yapıştırabilirsiniz):**

> Sivas ili Yıldızeli ilçesi Büyükakören (Büyük Akören) Köyü sakinleri ile Türkiye'nin ve dünyanın dört bir yanındaki Büyükakörenli hemşehrilerimiz arasında birlik, yardımlaşma ve dayanışmayı güçlendirmek amacıyla kurulmuş derneğimizin resmî bilgi platformudur. Web portalımız üzerinden güncel köy duyuruları, tamamlanan eğitim ve çevre faaliyet raporları, vefat ve taziye ilanları, köyümüzün 1907 Ağören ve 1928 Büyük Akviran dönemlerine uzanan tarihçesi, TÜİK nüfus kayıtları ve doğrudan dernek iletişim kanalları şeffaf biçimde sunulmaktadır. Köy okulumuz Büyük Akören Ortaokulu çevresindeki çalışmalarımıza, burs ve imece faaliyetlerimize destek ve görüşleriniz için web sitemiz üzerinden bize ulaşabilirsiniz.

6. **Web Sitesi:** `https://buyukakoren.vercel.app`
7. **Telefon ve E-posta:** Yalnızca derneğin resmî olarak aktif kullandığı telefon ve e-posta kesinleştikten sonra ekleyin (`TESLIM-ONCESI-EKSIKLER.md` kontrol edin).
8. **Eklenecek Fotoğraflar:**
   - Başlangıç için `public/images/katalog/01-koy-cevresi/01_kalekoy_kivsak_arasi_manzara.webp` ve `04-kirsal-yasam-tarim/04_sivas_daglar.webp` (açıklamada Yıldızeli bölgesi / Sivas kırsalı olduğu belirtilerek).
   - Dernekten gerçek köy fotoğrafları (okul, cami, köy girişi, dernek toplantısı) temin edildiğinde kapak ve galeri fotoğrafları olarak mutlaka ekleyin.
9. **Doğrulama:** Google'ın sunacağı telefon/SMS, video çekimi veya posta kartı doğrulama adımlarından birini dernek yetkilisi tamamlar.

---

## 4. Sosyal Paylaşım ve Open Graph (OG) Önizleme Kontrolü

Her duyuru ve faaliyet detay sayfasında ve Taziye sayfasında **WhatsApp**, **Facebook**, **X / Paylaş**, **Bağlantıyı Kopyala** ve **Yazdır** düğmeleri mevcuttur:
- Ana sayfada `https://buyukakoren.vercel.app/opengraph-image` dinamik kurumsal kartı (1200×630) otomatik üretilir.
- Kapak görseli olan duyurularda o duyuruya özel kapak fotoğrafı sosyal önizlemede çıkar.
- Canlı test araçları:
  - WhatsApp'ta doğrudan bir duyuru bağlantısı gönderildiğinde başlık, özet ve görsel önizlemesi yüklenir.
  - Facebook Sharing Debugger: `https://developers.facebook.com/tools/debug/` adresine URL yapıştırıp **Scrape Again** ile önbellek tazelenebilir.

---

## 5. İlk 30 Günlük İçerik ve Tanıtım Planı

Google'da `"Büyükakören"`, `"Büyük Akören Köyü"`, `"Yıldızeli Büyükakören"` ve `"Büyük Akören Derneği"` aramalarında kalıcı ilk sıra görünürlüğü için aşağıdaki takvimin düzenli uygulanması önerilir:

| Hafta | Yapılacak Yayın / İş | Hedef Arama / Fayda |
| :--- | :--- | :--- |
| **1. Hafta** | **Köy Rehberi Yazısı:** *"Yıldızeli Büyükakören Köyü'ne Nasıl Gidilir? Ulaşım, Mesafe ve Konum Rehberi"* (Sivas 62 km, Yıldızeli 49 km, posta kodu 58502 bilgileriyle) | Harita ve yol tarifi arayan hemşehriler için kalıcı organik trafik |
| **1. Hafta** | **Kurumsal Bilgi Girişi:** Gerçek IBAN, resmî telefon/e-posta, muhtar adı ve yönetim kurulu listesinin panelden güncellenmesi | Güvenilirlik ve Google İşletme Profili doğrulama uyumu |
| **2. Hafta** | **Kültür / Tarihçe Yazısı:** *"1907 Ağören'den Büyükakören'e: Köyümüzün Tarihçesi, Gelenekleri ve Nüfus Seyri"* | Yerel tarih ve soy araştırması aramalarında otorite içerik |
| **2. Hafta** | **Köy İçi Fotoğraf Çağrısı:** Köy muhtarlığı ve hemşehri WhatsApp gruplarından köy içi yüksek çözünürlüklü kareler toplanıp *"Büyükakören'den Kareler"* albümüne yüklenmesi | Görsellerin Google Görseller aramalarında indekslenmesi |
| **3. Hafta** | **Okul & Eğitim Desteği Haberi:** Büyük Akören Ortaokulu öğrencilerimiz veya yeni dönem burs/kırtasiye destek planına dair kısa rapor | Dernek faaliyetlerinin somut görünürlüğü |
| **4. Hafta** | **Taziye & Aidat Bilgilendirmesi:** Mevsimsel bakım duyurusu, varsa vefat/taziye ilanı (yakın rızasıyla) paylaşımı ve WhatsApp gruplarında portal bağlantısının duyurulması | Düzenli ziyaretçi dönüşü ve doğrudan marka araması |

---

### Yazı Yazarları İçin Hızlı İpucu
Admin panelinden her yeni duyuru eklediğinizde şu 3 maddeye dikkat edin:
1. Başlık açık olsun (ör. *"2026 Bahar İmece ve Mezarlık Temizliği Çağrısı"*).
2. Görsel yüklüyorsanız kısa bir fotoğraf açıklaması (alt metin) ve kimin çektiğini yazın.
3. Yayımla tuşuna bastığınızda site haritası ve IndexNow arkaplanda otomatik güncellenir; bağlantıyı **WhatsApp'ta Paylaş** ile dernek gruplarına iletebilirsiniz.
