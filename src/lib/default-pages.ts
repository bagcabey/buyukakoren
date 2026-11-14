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
            image_url: "/images/katalog/04-kirsal-yasam-tarim/07_geminbeli_manzara.webp",
            image_alt: "Yıldızeli ve Sivas kırsalı güneşli yayla ve bozkır panoraması",
            attribution: "Görsel: Zeynel Cebeci • CC BY-SA 4.0 (Wikimedia Commons — Sivas)",
            attribution_url: "https://commons.wikimedia.org/wiki/File:Geminbeli,_Zara_-_Sivas_01.jpg",
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
            image_url: "/images/katalog/01-koy-cevresi/01_kalekoy_kivsak_arasi_manzara.webp",
            image_alt: "Yıldızeli yaylası kırsal görünümü (Kaleköy–Kıvşak arası, Büyükakören yakın çevresi)",
            image_attribution: "Fotoğraf: cankurtaran • CC BY 3.0 (Yıldızeli bölgesi)",
            image_attribution_url: "https://commons.wikimedia.org/wiki/File:Kalek%C3%B6y_k%C4%B1vsak_aras%C4%B1_-_panoramio.jpg",
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
            image_url: "/images/katalog/01-koy-cevresi/01_kalekoy_kivsak_arasi_manzara.webp",
            image_alt: "Yıldızeli bölgesi köy çevresi ve yayla manzarası (Kaleköy–Kıvşak arası)",
            attribution: "Görsel: cankurtaran • CC BY 3.0 (Wikimedia Commons — Yıldızeli bölgesi)",
            attribution_url: "https://commons.wikimedia.org/wiki/File:Kalek%C3%B6y_k%C4%B1vsak_aras%C4%B1_-_panoramio.jpg",
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
              "## Ağören'den Büyükakören'e\n\nNişanyan Yer Adları Envanteri (Index Anatolicus) kayıtlarına göre köyümüzün adı **1907** yılı belgelerinde **Ağören**, **1928** yılı resmî kayıtlarında ise **Büyük Akviran** olarak geçmektedir. Cumhuriyet dönemi idari düzenlemeleriyle yerleşimimizin resmî adı **Büyükakören** (yaygın kullanımda **Büyük Akören**) olarak tescil edilmiştir.\n\n## Coğrafya, İklim ve Ulaşım\n\nSivas Yıldızeli köyleri arasında yer alan Büyükakören köyü, Sivas il merkezine **62 km**, Yıldızeli ilçe merkezine ise **49 km** uzaklıktadır. **1.276 metre** rakıma ve **33,8 km²** alana sahip yerleşimimizde karasal İç Anadolu bozkır iklimi görülür. Yaz ayları sıcak ve kurak, kış ayları soğuk ve kar yağışlıdır. Başlıca geçim kaynakları tahıl ve yem bitkileri tarımı ile küçükbaş/büyükbaş hayvancılıktır.\n\nSivas merkezden ve Yıldızeli ilçesinden kara yolu bağlantısıyla ulaşım sağlanmakta olup PTT posta kodu **58502**, telefon alan kodu **0346**'dır.",
            source_note:
              "Kaynaklar: Sevan Nişanyan Index Anatolicus (1907/1928), Vikipedi Büyükakören Maddesi, Harita Genel Müdürlüğü, PTT 58502 kayıtları.",
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
          id: "koy-agri-split",
          type: "image_text",
          visible: true,
          order: 5,
          data: {
            eyebrow: "Tarım ve Kırsal Ekonomi",
            title: "Tahıl Üretimi, Bozkır İklimi ve Yaşam",
            image_url: "/images/katalog/04-kirsal-yasam-tarim/01_sivas_bugday_hasadi.webp",
            image_alt: "Sivas kırsalında buğday hasadı ve tarımsal üretim",
            image_attribution: "Fotoğraf: Maurice Flesier • CC BY-SA 4.0 (Sivas kırsalı)",
            image_attribution_url: "https://commons.wikimedia.org/wiki/File:Wheat_harvest_in_Sivas_Province.jpg",
            image_position: "right",
            text: "Yıldızeli ve Büyükakören çevresinde temel geçim kaynağı buğday, arpa ve yem bitkileri tarımı ile hayvancılıktır. 1.276 metre rakımda şekillenen karasal iklimde yazlar sıcak ve kurak, kışlar kar yağışlı geçer.",
            bullets: [
              "Tahıl ve yem bitkileri tarımı",
              "Büyükbaş ve küçükbaş hayvancılık",
              "Yaz aylarında gurbetten dönüş ve imece kültürü",
            ],
            cta_label: "Kırsal Yaşam Galerisini İncele",
            cta_href: "/galeri",
          },
        },
        {
          id: "koy-edu",
          type: "card_grid",
          visible: true,
          order: 6,
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
          id: "koy-regional-showcase",
          type: "card_grid",
          visible: true,
          order: 7,
          data: {
            eyebrow: "Bölge Arşivi (Wikimedia Commons)",
            title: "Yıldızeli Çevresi ve Sivas Kültüründen Görseller",
            subtitle:
              "Doğrudan Büyükakören köyü içi fotoğraflarımız dernek arşivinden eklenene kadar, yakın çevremiz (Yıldızeli) ve il merkezimizin açık lisanslı kareleri sunulmaktadır.",
            columns: 3,
            cards: [
              {
                id: "reg-1",
                badge: "Yıldızeli Bölgesi (~7 km)",
                title: "Kaleköy – Kıvşak Arası Yayla",
                image_url: "/images/katalog/01-koy-cevresi/01_kalekoy_kivsak_arasi_manzara.webp",
                attribution: "Fotoğraf: cankurtaran • CC BY 3.0",
                attribution_url: "https://commons.wikimedia.org/wiki/File:Kalek%C3%B6y_k%C4%B1vsak_aras%C4%B1_-_panoramio.jpg",
                description: "Büyükakören'e komşu Yıldızeli köyleri hattından kırsal arazi dokusu.",
              },
              {
                id: "reg-2",
                badge: "Yıldızeli Kültürü",
                title: "Banaz Köyü – Pir Sultan Abdal Evi",
                image_url: "/images/katalog/02-yildizeli-ilcesi/02_banaz_pir_sultan_evi.webp",
                attribution: "Fotoğraf: BurakOtto • CC BY-SA 4.0",
                attribution_url: "https://commons.wikimedia.org/wiki/File:Pir_Sultan_Evi.jpg",
                description: "Yıldızeli ilçemizin bilinen tarihî ve kültürel miras duraklarından.",
              },
              {
                id: "reg-3",
                badge: "Yöresel Kültür",
                title: "Sivas Şehir Müzesi Köy Kıyafetleri",
                image_url: "/images/katalog/03-sivas-tarih-kultur/13_sehir_muzesi_koy_kiyafetleri.webp",
                attribution: "Fotoğraf: Dosseman • CC BY-SA 4.0",
                attribution_url: "https://commons.wikimedia.org/wiki/File:Sivas_%C5%9Eehir_M%C3%BCzesi_Costumes_of_villages_9896.jpg",
                description: "Sivas köylerinin geleneksel giyim kültürünü yansıtan müze seçkisi.",
              },
            ],
          },
        },
        {
          id: "koy-map",
          type: "map",
          visible: true,
          order: 8,
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
    {
      slug: "/kvkk",
      title: "KVKK Aydınlatma Metni",
      seo_title: "KVKK Aydınlatma Metni | Büyük Akören Köyü Derneği",
      seo_description:
        "6698 sayılı Kişisel Verilerin Korunması Kanunu (md. 10) kapsamında Büyük Akören Köyü Derneği kişisel veri işleme, aktarım ve saklama ilkeleri.",
      status: "published",
      show_in_menu: false,
      menu_order: 91,
      menu_label: "KVKK Aydınlatma Metni",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "kvkk-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "6698 Sayılı Kanun Madde 10",
            title: "KVKK Kişisel Verilerin Korunması Aydınlatma Metni",
            subtitle:
              "Veri Sorumlusu: Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği • Büyükakören Köyü, Yıldızeli / Sivas (58502)",
          },
        },
        {
          id: "kvkk-body",
          type: "rich_text",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Yasal Bilgilendirme",
            title: "Kişisel Verilerin İşlenme İlkeleri",
            content:
              "## 1. Veri Sorumlusu Kimliği\n\n6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca kişisel verileriniz; veri sorumlusu sıfatıyla **Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği** (Adres: Büyükakören Köyü, Yıldızeli / Sivas, Posta Kodu: 58502) tarafından aşağıda açıklanan çerçevede işlenmektedir.\n\n## 2. İşlenen Kişisel Veriler ve Toplama Yöntemi\n\n- **İletişim Formu:** Ad-soyad, isteğe bağlı telefon numarası, konu ve mesaj içeriği, açık rıza onay bilgisi ile kötü niyetli otomatik gönderimleri önlemek amacıyla tek yönlü özetlenmiş (anonimleştirilmiş) zaman/hız sınırı kaydı.\n- **Taziye İlanları:** Yalnızca yakınlarının açık rızası onaylanarak dernek yöneticilerince girilen merhum adı-soyadı ve cenaze bilgilendirme notları.\n- **Yönetim Paneli Kayıtları:** Yetkili dernek yöneticilerinin ve editörlerinin ad-soyad ve kullanıcı hesap kayıtları.\n\n## 3. İşleme Amaçları ve Hukuki Sebepler (KVKK Madde 5)\n\nİletişim formu üzerinden iletilen veriler; üyelik, dayanışma, duyuru, fotoğraf paylaşımı ve öneri başvurularınızın incelenerek yanıtlanması amacıyla 6698 sayılı Kanun'un 5. maddesinin 1. fıkrası (açık rıza) ve 2/f bendi (meşru menfaat) hukuki sebeplerine dayanılarak işlenir.\n\n## 4. Verilerin Aktarımı ve Yurt Dışı Barındırma (KVKK Madde 9)\n\nWeb portalımız bulut barındırma ve depolama altyapısı (Vercel Inc. ve şifreli nesne depolama altyapısı) üzerinden yayınlanmaktadır. 6698 sayılı Kanun'un 9. maddesinde yapılan güncel düzenlemeler kapsamında, iletişim formu mesajları iletildiği anda sunucu tarafında **AES-256-GCM algoritması ile şifrelenerek** özel erişimli depoda saklanır; yalnızca yetkili dernek yöneticileri tarafından görüntülenir ve üçüncü kişi veya ticari kurumlarla paylaşılmaz.\n\n## 5. Saklama Süresi ve İmha\n\nİletişim talebi mesajları, talebin sonuçlanmasını takip eden en fazla **1 (bir) yıl** (yasal yükümlülük gerektiren hallerde en çok 2 yıl) süreyle saklanır; süresi dolan veya silinmesi talep edilen kayıtlar yönetim paneli üzerinden kalıcı olarak silinir. Taziye ilanları belirli süre sonunda arşive alınabilir veya yakınlarının talebi üzerine yayından kaldırılır.\n\n## 6. İlgili Kişinin Hakları (KVKK Madde 11) ve Başvuru Yolu\n\nKVKK'nın 11. maddesi uyarınca derneğimize başvurarak kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, düzeltilmesini veya silinmesini/yok edilmesini isteme haklarına sahipsiniz. Başvurularınızı [İletişim Sayfası](/iletisim) üzerinden yazılı olarak iletebilirsiniz.",
            source_note:
              "Dayanak: 6698 sayılı Kişisel Verilerin Korunması Kanunu (md. 5, md. 9, md. 10, md. 11).",
          },
        },
      ],
    },
    {
      slug: "/gizlilik",
      title: "Gizlilik ve Çerez Politikası",
      seo_title: "Gizlilik ve Çerez Politikası | Büyük Akören Köyü Derneği",
      seo_description:
        "Büyük Akören Köyü Derneği web portalında yalnızca zorunlu güvenlik oturum çerezi kullanıldığına ve ziyaretçi gizliliğine ilişkin politika.",
      status: "published",
      show_in_menu: false,
      menu_order: 92,
      menu_label: "Gizlilik & Çerezler",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "gizlilik-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Gizlilik İlkesi",
            title: "Gizlilik ve Çerez (Cookie) Politikası",
            subtitle:
              "Ziyaretçilerimizden reklam veya davranışsal takip amacıyla hiçbir çerez veya izleme verisi toplanmaz.",
          },
        },
        {
          id: "gizlilik-body",
          type: "rich_text",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Şeffaflık Bildirimi",
            title: "Çerez Kullanımı ve Üçüncü Taraf Hizmetler",
            content:
              "## 1. Ziyaretçiler İçin Çerez Politikası\n\nBu web portalı, ziyaretçilerin site içinde gezinmesini takip eden, reklam profili oluşturan veya üçüncü taraf pazarlama ağlarıyla veri paylaşan **hiçbir analitik ya da reklam çerezi kullanmaz**. Bu nedenle genel ziyaretçi sayfalarında rahatsız edici bir çerez onay penceresi gösterilmez; ileride istatistik/analitik aracı eklenirse önceden açık rıza bandı sunulacaktır.\n\n## 2. Zorunlu Oturum ve Güvenlik Çerezi\n\nYalnızca [Yönetici Girişi](/admin) sayfasından oturum açan yetkili dernek yöneticileri ve editörler için, güvenli oturum doğrulaması amacıyla **`akoren_admin_session`** adlı zorunlu oturum çerezi (`HttpOnly`, `SameSite=Lax`, 12 saat süreli) tarayıcıda tutulur.\n\n## 3. Sunucu Güvenlik Kayıtları\n\nKötü niyetli giriş denemelerini ve iletişim formu spam saldırılarını engellemek amacıyla yalnızca tek yönlü özetlenmiş (hash'lenmiş) IP kimlikleri geçici hız sınırı penceresinde değerlendirilir.\n\n## 4. Harici Bağlantılar ve Harita Katmanı\n\nKöyümüz ve İletişim sayfalarında konum gösterimi için açık kaynaklı **OpenStreetMap** harita katmanı yer alabilir; ayrıca MEB, Yıldızeli Kaymakamlığı, Sivas Valiliği ve sosyal ağ bağlantıları harici adreslere yönlendirebilir. Harici sitelerin gizlilik uygulamaları ilgili kurumların sorumluluğundadır.",
            source_note: "Son güncelleme: 14 Kasım 2026 • Yalnızca zorunlu teknik çerezler aktif.",
          },
        },
      ],
    },
    {
      slug: "/kullanim-kosullari",
      title: "Kullanım Koşulları",
      seo_title: "Kullanım Koşulları | Büyük Akören Köyü Derneği",
      seo_description:
        "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî web portalı kullanım koşulları, içerik ilkeleri ve görsel lisans kuralları.",
      status: "published",
      show_in_menu: false,
      menu_order: 93,
      menu_label: "Kullanım Koşulları",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "kullanim-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Portal İlkeleri",
            title: "Kullanım Koşulları",
            subtitle:
              "Dernek web portalının kullanım esasları, telif hakları ve içerik doğruluğu ilkeleri.",
          },
        },
        {
          id: "kullanim-body",
          type: "rich_text",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Yayın İlkeleri",
            title: "Genel Hükümler",
            content:
              "## 1. Hizmetin Amacı\n\nBu web sitesi; Sivas ili Yıldızeli ilçesi Büyükakören Köyü sakinleri ve hemşehrilerimizin köy duyurularına, faaliyet raporlarına, taziye ilanlarına, doğrulanmış köy bilgilerine ve dernek iletişim kanallarına ulaşması amacıyla hazırlanmış kamusal bilgilendirme portalıdır.\n\n## 2. İçerik ve Telif Hakları\n\n- Portalda yayımlanan dernek duyuruları ve metinler kaynak gösterilerek paylaşılabilir.\n- Galeri ve sayfalarda yer alan tarih/coğrafya görselleri Wikimedia Commons özgür lisansları (CC0, Kamu Malı, CC BY, CC BY-SA) kapsamında sunulmakta olup, her görselin altında yer alan **yazar ve lisans atfı** kaldırılmadan kullanılabilir.\n\n## 3. Taziye ve Kişisel İçerik Paylaşımı\n\nTaziye ilanları yalnızca vefat eden hemşehrimizin yakınlarının rızası ile yayımlanır. Düzeltme veya kaldırma talepleriniz için [İletişim Sayfası](/iletisim) üzerinden yönetimle irtibata geçebilirsiniz.\n\n## 4. Sistem Güvenliği\n\nPortal formlarına otomatik spam gönderimi, yetkisiz erişim denemesi veya hizmet aksatıcı müdahaleler yasaktır ve hız sınırlama ile sunucu günlüğü koruması altındadır.",
          },
        },
      ],
    },
    {
      slug: "/kunye",
      title: "Kurumsal Künye",
      seo_title: "Kurumsal Künye | Büyük Akören Köyü Derneği",
      seo_description:
        "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği kurumsal künye, yönetim bilgileri ve portal sorumluluk bilgileri.",
      status: "published",
      show_in_menu: false,
      menu_order: 94,
      menu_label: "Künye",
      updated_at: now,
      revisions: [],
      blocks: [
        {
          id: "kunye-hero",
          type: "hero",
          visible: true,
          order: 1,
          data: {
            badge: "Resmî Künye",
            title: "Kurumsal Künye ve Yayın Bilgileri",
            subtitle:
              "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî yayın künyesi.",
          },
        },
        {
          id: "kunye-board",
          type: "board_members",
          visible: true,
          order: 2,
          data: {
            eyebrow: "Yönetim",
            title: "Yetkili Kurul ve Temsil",
            description:
              "Yönetim ve denetim kurulu bilgileri yönetici panelinden güncellendikçe burada yayınlanır.",
          },
        },
        {
          id: "kunye-legal",
          type: "rich_text",
          visible: true,
          order: 3,
          data: {
            eyebrow: "Yayıncı & Teknik Altyapı",
            title: "Yayın İlkeleri ve İletişim",
            content:
              "## Yayın Sahibi Kuruluş\n\n**Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği**\nYerleşim: Büyükakören Köyü, Yıldızeli / Sivas • Posta Kodu: 58502\n\n## İçerik Sorumluluğu ve Güncelleme\n\nPortal içerikleri dernek yönetimi tarafından yetkilendirilen yöneticiler ve editörler tarafından hazırlanır. Kütük numarası (DERBİS), vergi dairesi, kuruluş yılı ve güncel muhtar/iletişim bilgileri yönetici panelinden girildiğinde otomatik olarak bu sayfada ve ilgili bölümlerde yayınlanır.\n\n## Yasal Belgeler\n\n- [KVKK Aydınlatma Metni](/kvkk)\n- [Gizlilik ve Çerez Politikası](/gizlilik)\n- [Kullanım Koşulları](/kullanim-kosullari)\n- [Dernek İletişim Formu](/iletisim)",
          },
        },
      ],
    },
  ];
}
