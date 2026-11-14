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
- [ ] **Yönetim Kurulu Üyeleri ve Görev Dağılımı**: Başkan, Başkan Yardımcısı, Sayman, Sekreter ve Denetim kurulu isimleri Yönetici Paneli üzerinden eklenmelidir (boşken ziyaretçilere gizlenir).
- [ ] **Köy Muhtarı Adı ve İletişim Bilgisi**: Yıldızeli Büyükakören Köyü Muhtarlığı güncel bilgisi (boşken gizlenir).
- [ ] **Sosyal Medya Bağlantıları (Facebook, Instagram, YouTube, WhatsApp Grubu)**: Varsa resmi hesap adresleri Yönetici Paneli → *Menü ve Alt Bilgi / Sosyal Medya* alanından eklenmelidir.

## 3. Görsel ve İzin Eksikleri
- [ ] **Köye Ait Doğrudan Saha Fotoğrafları**: `gorseller/izin-bekleyen/` klasörüne taşınan çocuklu veya kaynağı belirsiz görseller için veli/kişi açık rızası alındıktan sonra Yönetici Paneli → *Galeri* bölümünden yüklenmelidir. Mevcut galerideki tüm fotoğraflar Wikimedia Commons lisanslı Yıldızeli/Sivas bölge arşividir ve gerçek yeriyle etiketlenmiştir.
- [ ] **Taziye Kayıtları**: İlk gerçek taziye duyurusu yakını rızası onayı işaretlenerek Yönetici Paneli → *Taziye* sekmesinden eklenmelidir.
