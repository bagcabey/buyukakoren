import Link from "next/link";
import {
  BookOpen,
  Building2,
  Compass,
  Landmark,
  MapPin,
  Sprout,
  Users,
} from "lucide-react";

const POPULATION_HISTORY = [
  { year: "1990", count: "997", num: 997 },
  { year: "2000", count: "1.691", num: 1691 },
  { year: "2013", count: "715", num: 715 },
  { year: "2021", count: "614", num: 614 },
];

const TIMELINE = [
  {
    period: "1907 Kayıtları",
    title: "Ağören",
    desc: "Nişanyan Index-Anatolicus ve geç Osmanlı dönemi yer adları kayıtlarında köyün adı Ağören olarak geçmektedir.",
  },
  {
    period: "1928 Kayıtları",
    title: "Büyük Akviran",
    desc: "Cumhuriyet'in ilk yıllarındaki resmî idari kayıtlarda köy yerleşimi Büyük Akviran adıyla listelenmiştir.",
  },
  {
    period: "1950–2000 Dönemi",
    title: "Büyükakören Yerleşimi",
    desc: "Yukarı Mahalle, Aşağı Mahalle ve Şeyhler Mahallesi dokusuyla gelişen köyde 2000 yılında nüfus 1.691'e ulaşmıştır.",
  },
  {
    period: "Günümüz",
    title: "Dayanışma ve Dernekleşme",
    desc: "Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği öncülüğünde ağaçlandırma, temizlik ve eğitim projeleri sürdürülmektedir.",
  },
];

export default function KoyumuzPage() {
  const maxPop = 1691;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="border-b border-[#e6e5e0] pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Sivas • Yıldızeli
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Büyük Akören (Büyükakören) Köyü ve Tarihçesi
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Açık erişimli idari kayıtlar, tarihî yer adları indeksleri ve TÜİK
          verilerinden derlenen teyitli köy profili.
        </p>
      </div>

      {/* Main Panoramic Image */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-2 sm:mt-8">
        <img
          src="/images/koy/01_koy_panoramik.jpg"
          alt="Büyük Akören Köyü Panoramik Görünüm"
          className="aspect-[16/10] w-full rounded-lg object-cover sm:aspect-[16/8]"
        />
        <p className="px-2 pt-2 text-xs text-[#666560]">
          Büyükakören Köyü genel yerleşim görünümü — Sivas il merkezine 62 km,
          Yıldızeli ilçe merkezine 49 km mesafededir.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#666560]">
            <BookOpen className="h-4 w-4" />
            Tarihî Adlandırma
          </div>
          <p className="mt-2 text-lg font-semibold text-[#191919]">
            Ağören (1907) • Büyük Akviran (1928)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            Nişanyan Index-Anatolicus ve Cumhuriyet dönemi idari kayıtlarında
            geçen eski köy adları.
          </p>
        </div>

        <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#666560]">
            <MapPin className="h-4 w-4" />
            Coğrafi Konum
          </div>
          <p className="mt-2 text-lg font-semibold text-[#191919]">
            39°36′11″K, 36°26′17″D
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            Rakım yaklaşık 1.276 m. İç Anadolu karasal iklimi hakimdir.
          </p>
        </div>

        <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#666560]">
            <Landmark className="h-4 w-4" />
            Yerleşim & Yapılar
          </div>
          <p className="mt-2 text-lg font-semibold text-[#191919]">
            3 Mahalle • 3 Cami
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#666560]">
            Yukarı Mahalle, Aşağı Mahalle, Şeyhler Mahallesi; Merkez, Yeni ve
            Şeyhler Camileri ile Büyük Akören İlk/Ortaokulu.
          </p>
        </div>
      </div>

      {/* History Timeline & Population */}
      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div>
            <h2 className="text-xl font-semibold text-[#191919]">
              Tarihçe ve Yer Adı Kökeni
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#666560]">
              Anadolu toponimisinde &ldquo;Akören / Akviran&rdquo; adı
              genellikle eski bir yerleşim kalıntısı (ören yeri) üzerine kurulan
              veya beyaz toprak/taş dokusuyla öne çıkan yerleşimler için
              kullanılan tarihî bir adlandırmadır. Zaman içerisinde ses
              değişimiyle günümüzdeki{" "}
              <strong className="text-[#191919]">
                Büyükakören (Büyük Akören)
              </strong>{" "}
              biçimini almıştır.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {TIMELINE.map((t) => (
              <div
                key={t.period}
                className="rounded-xl border border-[#e6e5e0] bg-white p-4"
              >
                <span className="inline-block rounded bg-[#f4f3ef] px-2 py-0.5 text-[11px] font-semibold text-[#191919]">
                  {t.period}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-[#191919]">
                  {t.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#666560]">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Village Structure */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#191919]">
                <Building2 className="h-4 w-4 text-[#666560]" />
                Eğitim & İbadet Yapıları
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#666560]">
                Köyümüzde Büyük Akören İlkokulu ve Ortaokulu ile Merkez Cami,
                Yeni Cami ve Şeyhler Cami bulunmaktadır.
              </p>
            </div>
            <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#191919]">
                <Sprout className="h-4 w-4 text-[#666560]" />
                Ekonomi & İklim
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#666560]">
                Köy ekonomisi temel olarak tarım ve hayvancılığa dayanır; İç
                Anadolu bölgesinin karasal iklim özellikleri görülür.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 text-xs text-[#666560]">
            <strong className="text-[#191919]">Kaynakça:</strong> Nişanyan
            Index-Anatolicus Yer Adları Veritabanı, TÜİK Adrese Dayalı Nüfus
            Kayıt Verileri, T.C. Yıldızeli Kaymakamlığı ve MEB resmî kurum
            kayıtları.
          </div>
        </div>

        {/* Population Table & Visual Bars */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#191919]">
              <Users className="h-4 w-4 text-[#666560]" />
              Resmî Nüfus Seyri (TÜİK)
            </div>
            <div className="mt-4 space-y-3">
              {POPULATION_HISTORY.map((row) => {
                const pct = Math.round((row.num / maxPop) * 100);
                return (
                  <div key={row.year}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#666560]">
                        {row.year}
                      </span>
                      <span className="font-semibold text-[#191919]">
                        {row.count} kişi
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#f4f3ef]">
                      <div
                        className="h-full rounded-full bg-[#191919]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=39.603056,36.438056"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
            >
              <Compass className="h-3.5 w-3.5" />
              Haritada Konumu Aç
            </a>
          </div>

          <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4">
            <p className="text-xs font-semibold text-[#191919]">
              Büyük Akören Okulu & Kış Kareleri
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <img
                src="/images/koy/05_buyuk_akoren_okulu.jpg"
                alt="Büyük Akören İlkokulu ve Ortaokulu"
                className="aspect-[4/3] w-full rounded-lg border border-[#e6e5e0] object-cover"
              />
              <img
                src="/images/koy/06_koy_kis_manzarasi.jpg"
                alt="Büyük Akören Kış Manzarası"
                className="aspect-[4/3] w-full rounded-lg border border-[#e6e5e0] object-cover"
              />
            </div>
            <Link
              href="/galeri"
              className="mt-3 inline-block text-xs font-medium text-[#191919] underline"
            >
              Tüm Fotoğraf Galerisine Git →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
