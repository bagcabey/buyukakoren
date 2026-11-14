# Teslim Öncesi Eksikler — Büyük Akören Köyü Derneği

Bu dosya, dernek yönetimi ve site sorumlusu Ömer Bağçabaşı tarafından canlı teslim öncesinde veya hemen sonrasında tamamlanması gereken gerçek kurumsal veri ve ortam ayarlarını listeler. Kod içinde hiçbir gerçek dışı kurumsal veri, yer tutucu metin veya şifre bırakılmamıştır; boş olan alanlar ziyaretçi arayüzünde otomatik olarak gizlenmektedir.

---

## 1. Sunucu / Vercel Ortam Değişkenleri (Yönetici Girişi İçin)
- [ ] **Vercel Dashboard → `buyukakoren` → Settings → Environment Variables** altından aşağıdaki değişkenleri tanımlayın (Production & Preview):
  - `ADMIN_PASSWORD`: Dernek yöneticisi için güçlü ilk giriş şifresi (en az 12 karakter, harf + rakam + sembol)
  - `ADMIN_SESSION_SECRET`: 32+ karakter rastgele imza anahtarı
  - *(Not: Yerel Vercel CLI oturumu kapalı olduğu için bu değerler CLI üzerinden uzaktan eklenememiştir. Vercel'de `ADMIN_PASSWORD` tanımlanana kadar veya Yönetici Paneli üzerinden kullanıcı hesabı oluşturulana kadar yönetici girişi güvenli şekilde kapalı kalır.)*

## 2. Dernekten Alınacak Gerçek Kurumsal Bilgiler (`/admin` → Genel Ayarlar & Bağış)
- [ ] **Resmî Banka Hesap Adı, Banka Adı ve TR IBAN**: Yönetici Paneli → *Genel Ayarlar* sekmesinden geçerli 26 haneli `TR...` IBAN girilmelidir (sistem Mod-97 doğrulaması yapar; geçersiz IBAN kaydedilmez).
- [ ] **Resmî Dernek Telefonu ve E-posta Adresi**: Boş bırakıldığı sürece sitede telefon/e-posta kutusu ve telefon bağlantıları gizlenir.
- [ ] **Dernek Kütük Numarası (DERBİS), Vergi Dairesi ve Kuruluş Yılı**: Yönetici Paneli → *Genel Ayarlar* üzerinden girildiğinde Künye (`/kunye`) ve Dernek (`/dernek`) sayfalarında otomatik görünür.
- [ ] **Dernek Başkanı ve Yönetim Kurulu Onayı**: Mevcut kayıtta Dernek Başkanı olarak **Mustafa Tanju Çetiner** yer almaktadır (dernek yönetimiyle güncel görev teyidi yapılmalıdır). Başkan Yardımcısı, Sayman, Sekreter ve Denetim Kurulu üyeleri Yönetici Paneli üzerinden eklenmelidir (boşken ziyaretçilere gizlenir).
- [ ] **Güncel Köy Muhtarı Bilgisi**: Tarihsel kayıtlarda 2024 öncesi dönemlere ait isimler (*Hasan Özüdoğru*, *Yaşar Kavaklı*) geçmekle birlikte 31 Mart 2024 sonrası güncel muhtar bilgisi doğrulanamadığı için sitede yayınlanmamıştır. Yıldızeli Büyükakören Köyü Muhtarlığı güncel adı ve telefonu teyit edilip panelden girilmelidir.
- [ ] **Doğrulanmamış Köy Yapı Bilgileri (Mahalle / Cami Sayısı)**: Eski metinlerde yer alan `"3 Mahalle • 3 Cami"` ifadesi resmî bir kaynakla doğrulanamadığı için siteden kaldırılmıştır; dernek yönetimi tarafından doğrulanırsa Sayfa Tasarımcısı → `/koyumuz` üzerinden eklenebilir.
- [ ] **Sosyal Medya Bağlantıları (Facebook, Instagram, YouTube, WhatsApp Grubu)**: Varsa resmi hesap adresleri Yönetici Paneli → *Menü ve Alt Bilgi / Sosyal Medya* alanından eklenmelidir.
- [ ] **Alt Bilgi (Footer) Site Yazılımcısı Bağlantısı Kontrolü**: Alt bilgide `Ömer Bağçabaşı` adına tanımlı portfolyo URL'si (`https://omer-bahcebasi-protfolio-phi-silk-yuvqondwda.vercel.app`) geliştirici talebi gereği korunmuştur; soyadı ve portfolyo adresinin yazım doğruluğu teslim öncesi son kez onaylanmalıdır.

## 3. Görsel ve İzin Eksikleri
- [ ] **Köye Ait Doğrudan Saha Fotoğrafları (`dernekten fotoğraf izni / orijinal dosya istenecek`)**: Yüzü tanınabilir çocuk veya kaynağı/çözünürlüğü belirsiz görseller (`01_koy_panoramik.jpg`, `02_agac_dikim_temiz.jpg`, `03_koy_cocuklari_temizlik.jpg`, `04_tarih_kultur_gezisi_iletisim.jpg`, `05_buyuk_akoren_okulu.jpg` ve `06_koy_kis_manzarasi.jpg`) yayından çıkarılarak orijinalleri silinmeden `gorseller/izin-bekleyen/` klasörüne taşınmıştır. Yerlerine Wikimedia Commons'tan açık lisanslı 31 Yıldızeli/Sivas bölge ve kültür görseli (yazar ve lisans atfıyla) eklenmiştir; doğrudan Büyükakören köy içi (okul, cami, çeşme, mahalleler ve etkinlik) fotoğrafları dernekten açık yayın izni ile alındığında Yönetici Paneli → *Galeri* bölümünden yüklenmelidir.
- [ ] **Taziye Kayıtları**: İlk gerçek taziye duyurusu yakını rızası onayı işaretlenerek Yönetici Paneli → *Taziye* sekmesinden eklenmelidir.


## 4. Google Search Console ve Google İşletme Profili Onayı (Oturum Gerektirir)
- [ ] **Google Search Console (`https://search.google.com/search-console`)**: Ömer Bağçabaşı veya dernek Google hesabıyla oturum açarak mülkü (`https://buyukakoren.vercel.app`) seçin, `sitemap.xml` haritasını gönderin ve ana sayfalar için *Dizine Eklenmesini İste* işlemini başlatın. *(Site sahiplik doğrulaması `google5cdf4f27709d4a0f.html` ile hazırdır; ancak tarayıcıda açık Google oturumu olmadığı için bu adım otomatikleştirilmemiştir.)*
- [ ] **Google İşletme Profili (`https://business.google.com`)**: `GOOGLE-TANITIM-REHBERI.md` içindeki 722 karakterlik hazır tanıtım metni, kategori ve bölge önerileriyle dernek yetkilisi adına işletme profilini açıp Google doğrulama kodunu/videosunu tamamlayın.
