import { PageConfig } from "./types";

export function buildDefaultPages(): PageConfig[] {
  const now = "2026-11-14T00:00:00.000Z";

  return [
    {
      slug: "/",
      title: "Ana Sayfa",
      seo_title: "Büyük Akören Köyü Derneği | Yıldızeli, Sivas",
      seo_description:
        "Sivas Yıldızeli Büyükakören (Büyük Akören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî duyuru, faaliyet, taziye ve iletişim portalı.",
      status: "published",
      show_in_menu: true,
      menu_order: 1,
      menu_label: "Ana Sayfa",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "home-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Sivas • Yıldızeli • Posta Kodu 58502",
            title: "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği",
            subtitle:
              "Köyümüz ile Türkiye'nin ve dünyanın dört bir yanındaki Büyükakörenli hemşehrilerimiz arasındaki birlik, dayanışma ve bilgi köprüsü.",
            image_url: "/images/koy/01_koy_panoramik.jpg",
            image_alt: "Büyük Akören Köyü ve Anadolu bozkır panoraması",
            primary_label: "Köyümüzü Tanıyın",
            primary_href: "/koyumuz",
            secondary_label: "Duyurular & Haberler",
            secondary_href: "/duyurular",
          },
        },
        {
          id: "home-stats",
          type: "stats",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Doğrulanmış Resmî Veriler",
            title: "Rakamlarla Büyükakören Köyü",
            subtitle:
              "Kaynak: TÜİK Adrese Dayalı Nüfus Kayıt Sistemi (2025), PTT ve Harita Genel Müdürlüğü.",
            items: [
              { id: "st1", label: "2025 Nüfusu (TÜİK)", value: "449 Kişi", subtext: "237 Erkek • 212 Kadın" },
              { id: "st2", label: "Rakım", value: "1.276 m", subtext: "Yüzölçümü: 33,8 km²" },
              { id: "st3", label: "İl & İlçe Mesafesi", value: "62 / 49 km", subtext: "Sivas 62 km • Yıldızeli 49 km" },
              { id: "st4", label: "Posta & Alan Kodu", value: "58502", subtext: "Telefon Alan Kodu: 0346" },
            ],
          },
        },
        {
          id: "home-posts",
          type: "latest_posts",
          visible: true,
          order: 3,
          data: {
            eyebrow: "Güncel Yayınlar",
            title: "Son Duyuru, Haber ve Faaliyetler",
            limit: 6,
            category: "all",
            more_label: "Tüm Duyurulara Git",
            more_href: "/duyurular",
          },
        },
        {
          id: "home-village-split",
          type: "image_text",
          visible: true,
          order: 4,
          data: {
            eyebrow: "Köyümüz & Eğitim",
            title: "Kadim Anadolu Yerleşimi: Ağören'den Büyükakören'e",
            image_url: "/images/koy/01_koy_panoramik.jpg",
            image_alt: "Sivas Yıldızeli Büyükakören coğrafyası",
            image_position: "left",
            text: "1907 yılı kayıtlarında Ağören, 1928 yılı kayıtlarında ise Büyük Akviran adıyla geçen yerleşimimiz; Sivas ili Yıldızeli ilçesine bağlı köklü bir Anadolu köyüdür.\n\nKöyümüzde Büyük Akören Ortaokulu eğitim-öğretim faaliyetlerini sürdürmektedir.",
            bullets: [
              "Koordinatlar: 39°36′11″K 36°26′17″D",
              "Büyük Akören Ortaokulu Tel: (0346) 753 11 22",
              "PTT Posta Kodu: 58502",
            ],
            cta_label: "Tarihçe ve Nüfus Verilerini İncele",
            cta_href: "/koyumuz",
          },
        },
        {
          id: "home-gallery",
          type: "gallery_preview",
          visible: true,
          order: 5,
          data: {
            eyebrow: "Görsel Arşiv",
            title: "Bölgeden ve Çevreden Kareler",
            limit: 6,
            album: "Tümü",
            more_label: "Tüm Galeriyi Görüntüle",
            more_href: "/galeri",
          },
        },
        {
          id: "home-iban",
          type: "iban_card",
          visible: true,
          order: 6,
          data: {
            eyebrow: "Dayanışma & Destek",
            title: "Dernek Bağış ve Aidat Hesabı",
            description:
              "Köyümüzün ortak ihtiyaçları ve hemşehri dayanışması için resmî dernek hesabı tanımlandığında burada yayınlanır.",
          },
        },
        {
          id: "home-cta",
          type: "cta",
          visible: true,
          order: 7,
          data: {
            theme: "dark",
            eyebrow: "Birlikte Güçlüyüz",
            title: "Görüş, Öneri veya Fotoğraf Paylaşmak İster misiniz?",
            description:
              "Köyümüzle ilgili anılarınızı, eski/yeni fotoğraflarınızı veya dernek yönetimine taleplerinizi iletişim kanalı üzerinden ulaştırabilirsiniz.",
            primary_label: "Derneğe Mesaj Gönder",
            primary_href: "/iletisim",
            secondary_label: "Taziye İlanları",
            secondary_href: "/taziye",
          },
        },
      ],
    },
    {
      slug: "/koyumuz",
      title: "Köyümüz & Tarihçe",
      seo_title: "Büyükakören (Büyük Akören) Köyü Tarihçe ve Nüfusu | Yıldızeli",
      seo_description:
        "Sivas Yıldızeli Büyükakören Köyü tarihçesi (1907 Ağören, 1928 Büyük Akviran), coğrafyası (1.276 m rakım, 33,8 km²), TÜİK 1990-2025 nüfus verileri ve Büyük Akören Ortaokulu bilgileri.",
      status: "published",
      show_in_menu: true,
      menu_order: 5,
      menu_label: "Köyümüz",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "koy-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Sivas • Yıldızeli • 58502",
            title: "Büyükakören (Büyük Akören) Köyü",
            subtitle:
              "Doğrulanmış coğrafi konumu, Nişanyan yer adları tarihi, TÜİK nüfus seyri ve köy okulu bilgileriyle köyümüzün resmî bilgi sayfası.",
            image_url: "/images/koy/01_koy_panoramik.jpg",
            image_alt: "Büyükakören Köyü çevre manzarası",
            primary_label: "Dernek Çalışmaları",
            primary_href: "/dernek",
            secondary_label: "İletişim & Konum",
            secondary_href: "/iletisim",
          },
        },
        {
          id: "koy-stats",
          type: "stats",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Coğrafi ve İdari Kimlik",
            title: "Temel Bilgiler",
            subtitle: "Kaynaklar: PTT, BTK, Harita Genel Müdürlüğü, Vikipedi, Nişanyan Index Anatolicus.",
            items: [
              { id: "ks1", label: "İl / İlçe", value: "Sivas / Yıldızeli", subtext: "Köy statüsü (resmî ad: Büyükakören)" },
              { id: "ks2", label: "Rakım & Yüzölçümü", value: "1.276 m", subtext: "33,8 km² yerleşim ve tarım alanı" },
              { id: "ks3", label: "Ulaşım Mesafesi", value: "Sivas 62 km", subtext: "Yıldızeli ilçe merkezine 49 km" },
              { id: "ks4", label: "Posta & Alan Kodu", value: "58502 / 0346", subtext: "39°36′11″K 36°26′17″D" },
            ],
          },
        },
        {
          id: "koy-history",
          type: "rich_text",
          visible: true,
          order: 3,
          data: {
            eyebrow: "Tarihsel Arka Plan",
            title: "Eski Adlar ve Yerleşim Tarihi",
            content:
              "## Ağören'den Büyükakören'e\n\nNişanyan Yer Adları Envanteri (Index Anatolicus) kayıtlarına göre köyümüzün adı **1907** yılı belgelerinde **Ağören**, **1928** yılı resmî kayıtlarında ise **Büyük Akviran** olarak geçmektedir. Cumhuriyet dönemi idari düzenlemeleriyle yerleşimimizin adı **Büyükakören** (yaygın kullanımda Büyük Akören) olarak tescil edilmiştir.\n\n## Coğrafya ve Geçim Kaynakları\n\nSivas il merkezinin batısında, Yıldızeli ilçesine bağlı olarak 1.276 metre rakımda yer alan köyümüz 33,8 km² yüzölçümüne sahiptir. Yüksek rakımlı İç Anadolu iklimi nedeniyle bölge halkının geleneksel geçim kaynakları tarım (tahıl ve yem bitkileri) ile küçükbaş ve büyükbaş hayvancılıktır.",
            source_note:
              "Kaynaklar: Sevan Nişanyan Index Anatolicus (1907/1928), Vikipedi Büyükakören Maddesi, Harita Genel Müdürlüğü.",
          },
        },
        {
          id: "koy-pop",
          type: "timeline",
          visible: true,
          order: 4,
          data: {
            eyebrow: "Demografi",
            title: "Yıllara Göre Resmî Nüfus (TÜİK ADNKS)",
            description:
              "Türkiye İstatistik Kurumu Adrese Dayalı Nüfus Kayıt Sistemi ve genel nüfus sayımı verileri:",
            items: [
              { id: "p1990", year: "1990", value: "997 Kişi", note: "Genel Nüfus Sayımı" },
              { id: "p2000", year: "2000", value: "1.691 Kişi", note: "Genel Nüfus Sayımı" },
              { id: "p2013", year: "2013", value: "715 Kişi", note: "TÜİK ADNKS" },
              { id: "p2021", year: "2021", value: "614 Kişi", note: "TÜİK ADNKS" },
              { id: "p2024", year: "2024", value: "482 Kişi", note: "TÜİK ADNKS" },
              {
                id: "p2025",
                year: "2025",
                value: "449 Kişi",
                note: "237 Erkek, 212 Kadın (TÜİK ADNKS)",
                highlight: true,
              },
            ],
          },
        },
        {
          id: "koy-edu",
          type: "card_grid",
          visible: true,
          order: 5,
          data: {
            eyebrow: "Eğitim ve Kamu Kurumları",
            title: "Köyümüzdeki Eğitim Kurumu",
            columns: 2,
            cards: [
              {
                id: "edu-1",
                badge: "T.C. Millî Eğitim Bakanlığı",
                title: "Büyük Akören Ortaokulu",
                description:
                  "Köyümüzde aktif eğitim veren resmî ortaokulumuzdur. İletişim Tel: (0346) 753 11 22",
                link_label: "MEB Resmî Sayfası",
                link_href: "https://buyukakorenoo.meb.k12.tr",
              },
              {
                id: "edu-2",
                badge: "Katkı Çağrısı",
                title: "Köyümüzden Bilgi & Fotoğraf Paylaşın",
                description:
                  "Mahalle tarihçesi, cami, çeşme, yayla ve dernek etkinliklerine dair belgelenmiş bilgi ve görselleri bizimle paylaşabilirsiniz.",
                link_label: "İletişim Sayfası",
                link_href: "/iletisim",
              },
            ],
          },
        },
        {
          id: "koy-map",
          type: "map",
          visible: true,
          order: 6,
          data: {
            title: "Büyükakören Konum Haritası",
            description:
              "Koordinatlar: 39°36′11″K 36°26′17″D (Yıldızeli, Sivas, Türkiye)",
            lat: 39.603056,
            lng: 36.438056,
            zoom: 13,
          },
        },
      ],
    },
    {
      slug: "/dernek",
      title: "Derneğimiz & Yönetim",
      seo_title: "Büyük Akören Köyü Derneği | Amaç ve Yönetim",
      seo_description:
        "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği tüzük ilkeleri, faaliyet alanları ve yönetim kurulu.",
      status: "published",
      show_in_menu: true,
      menu_order: 6,
      menu_label: "Derneğimiz",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "dernek-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Kurumsal Yapı",
            title: "Büyük Akören Köyü Derneği",
            subtitle:
              "Hemşehri dayanışmasını güçlendirmek, köyümüzün altyapı, eğitim ve kültür ihtiyaçlarına katkı sunmak ve şeffaf iletişim sağlamak için çalışıyoruz.",
            primary_label: "Faaliyet Raporları",
            primary_href: "/faaliyetler",
            secondary_label: "Bağış ve Aidat",
            secondary_href: "/bagis",
          },
        },
        {
          id: "dernek-mission",
          type: "card_grid",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Çalışma İlkelerimiz",
            title: "Temel Amaç ve Sorumluluk Alanlarımız",
            columns: 3,
            cards: [
              {
                id: "m1",
                badge: "01 • Dayanışma",
                title: "Hemşehri Birliği & Taziye",
                description:
                  "Köyümüzdeki ve gurbetteki Büyükakörenlilerin iyi günde ve acı günde yanında olmak, vefat ve taziye duyurularını hızla ulaştırmak.",
              },
              {
                id: "m2",
                badge: "02 • Eğitim & Gençlik",
                title: "Eğitim ve Kültür Desteği",
                description:
                  "Köy okulumuzun ihtiyaçlarını desteklemek, gençlerimizin eğitim süreçlerine katkıda bulunmak ve kültürel mirası geleceğe taşımak.",
              },
              {
                id: "m3",
                badge: "03 • Şeffaflık",
                title: "Hesap Verebilir Yönetim",
                description:
                  "Tüm duyuru, toplantı kararları ve faaliyet sonuçlarını internet sitemiz üzerinden düzenli olarak paylaşmak.",
              },
            ],
          },
        },
        {
          id: "dernek-board",
          type: "board_members",
          visible: true,
          order: 3,
          data: {
            eyebrow: "Yönetim",
            title: "Yönetim Kurulu",
            description:
              "Dernek yönetim kurulu üyeleri genel kurul kararları doğrultusunda görev yapar.",
          },
        },
        {
          id: "dernek-cta",
          type: "cta",
          visible: true,
          order: 4,
          data: {
            theme: "light",
            eyebrow: "Üyelik ve Katılım",
            title: "Dernek Çalışmalarına Katılmak İster misiniz?",
            description:
              "Üyelik başvurusu, toplantı takvimi veya gönüllü destek önerileriniz için yönetime doğrudan mesaj gönderebilirsiniz.",
            primary_label: "Yönetime Mesaj Gönder",
            primary_href: "/iletisim",
          },
        },
      ],
    },
    {
      slug: "/bagis",
      title: "Bağış & Aidat",
      seo_title: "Bağış ve Aidat Bilgileri | Büyük Akören Köyü Derneği",
      seo_description:
        "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî bağış ve aidat bilgilendirme sayfası.",
      status: "published",
      show_in_menu: true,
      menu_order: 8,
      menu_label: "Bağış",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "bagis-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Şeffaf Katkı & Aidat",
            title: "Bağış ve Üyelik Aidatı",
            subtitle:
              "Derneğimizin köyümüz yararına yürüttüğü çalışma ve yardımlaşma faaliyetlerine destek hakkında resmî bilgilendirme.",
            primary_label: "Faaliyet Raporları",
            primary_href: "/faaliyetler",
            secondary_label: "İletişime Geç",
            secondary_href: "/iletisim",
          },
        },
        {
          id: "bagis-iban",
          type: "iban_card",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Resmî Banka Bilgisi",
            title: "Dernek Banka Hesabı",
            description:
              "Havale/EFT işlemlerinizde açıklama kısmına ad-soyad ve katkı türünü (Aidat / Bağış / İhtiyaç Fonu) yazmanız muhasebe kaydı için önemlidir.",
          },
        },
        {
          id: "bagis-faq",
          type: "faq",
          visible: true,
          order: 3,
          data: {
            eyebrow: "Sıkça Sorulanlar",
            title: "Bağış ve Makbuz Süreci Hakkında",
            items: [
              {
                id: "fq1",
                question: "Bağış yaparken açıklama kısmına ne yazmalıyım?",
                answer:
                  "Gönderim yapan kişinin adı-soyadı ve katkının amacı (Örneğin: Üye Aidatı veya Köy Yardımlaşma Bağışı) yazılmalıdır.",
              },
              {
                id: "fq2",
                question: "Makbuz ve gelir-gider takibi nasıl yapılır?",
                answer:
                  "Derneğimizin tüm gelir ve gider kalemleri 5253 sayılı Dernekler Kanunu çerçevesinde resmî defterlere işlenir ve genel kurula sunulur.",
              },
            ],
          },
        },
      ],
    },
    {
      slug: "/iletisim",
      title: "İletişim",
      seo_title: "İletişim | Büyük Akören Köyü Derneği",
      seo_description:
        "Büyük Akören Köyü Derneği iletişim formu, konum haritası ve köy muhtarlık/okul resmî bilgileri.",
      status: "published",
      show_in_menu: true,
      menu_order: 9,
      menu_label: "İletişim",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "iletisim-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Doğrudan İletişim",
            title: "Dernek Yönetimi ve Köy İletişimi",
            subtitle:
              "Üyelik başvurusu, duyuru talebi, köyümüzle ilgili fotoğraf paylaşımı veya önerileriniz için aşağıdaki formu güvenle doldurabilirsiniz.",
          },
        },
        {
          id: "iletisim-card",
          type: "contact_card",
          visible: true,
          order: 2,
          data: {
            title: "İletişim Bilgileri & Mesaj Formu",
            description:
              "Gönderdiğiniz mesajlar şifreli olarak saklanır ve yalnızca yetkili dernek yöneticilerine iletilir.",
            show_form: true,
          },
        },
        {
          id: "iletisim-map",
          type: "map",
          visible: true,
          order: 3,
          data: {
            title: "Köy Konumu ve Yol Tarifi",
            description:
              "Büyükakören Köyü, Yıldızeli / Sivas (Posta Kodu: 58502 • 39°36′11″K 36°26′17″D)",
            lat: 39.603056,
            lng: 36.438056,
            zoom: 13,
          },
        },
      ],
    },
  ];
}
