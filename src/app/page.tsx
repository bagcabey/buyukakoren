import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  HeartHandshake,
  Landmark,
  MapPin,
  Phone,
  Pin,
} from "lucide-react";
import { CopyIbanButton } from "@/components/CopyIbanButton";
import { CATEGORY_LABELS, STATUS_LABELS, formatDateTR } from "@/lib/format";
import { getAllStoreData, getPublishedPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, data] = await Promise.all([
    getPublishedPosts(),
    getAllStoreData(),
  ]);

  const pinnedPost = posts.find((p) => p.is_pinned);
  const latestAnnouncements = posts
    .filter((p) => p.category !== "faaliyet")
    .slice(0, 3);
  const latestActivities = posts
    .filter((p) => p.category === "faaliyet")
    .slice(0, 3);
  const publishedCondolences = data.condolences.filter((c) => c.is_published);
  const latestCondolences = publishedCondolences.slice(0, 2);
  const settings = data.site_settings;

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-[#e6e5e0] bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6 sm:pt-5">
          {pinnedPost && (
            <Link
              href={`/duyurular/${pinnedPost.slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] px-3.5 py-2.5 transition-all hover:border-[#cfcec8] hover:bg-[#f4f3ef] sm:px-4 sm:py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#191919] px-2 py-1 text-[10px] font-semibold tracking-wide text-white sm:text-[11px]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  <Pin className="hidden h-3 w-3 sm:inline" />
                  Sabit Duyuru
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-[#191919] group-hover:underline sm:text-[13px]">
                    {pinnedPost.title}
                  </p>
                  <p className="text-[10px] text-[#666560] sm:hidden">
                    {formatDateTR(pinnedPost.published_at)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden text-xs text-[#666560] sm:inline">
                  {formatDateTR(pinnedPost.published_at)}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#191919] transition-colors group-hover:bg-[#191919] group-hover:text-white">
                  İncele
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          )}
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-5 px-4 pt-5 pb-7 sm:gap-8 sm:px-6 sm:py-12 lg:grid-cols-12 lg:gap-10 lg:py-14">
          {/* Headline & Subtitle */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[#666560] uppercase sm:px-3 sm:text-xs">
              <MapPin className="h-3 w-3 shrink-0 text-[#191919]" />
              <span>SİVAS • YILDIZELİ • BÜYÜKAKÖREN</span>
            </div>
            <h1 className="mt-3 text-[25px] font-semibold leading-[1.18] tracking-tight text-[#191919] sm:mt-4 sm:text-5xl sm:leading-[1.12]">
              {settings.hero_title}
            </h1>
            <p className="mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-[#666560] sm:mt-4 sm:text-lg">
              {settings.hero_subtitle}
            </p>
          </div>

          {/* Village Visual Showcase Card (Appears cleanly right below intro on mobile, right column on desktop) */}
          <div className="lg:col-span-5 lg:row-span-2">
            <div className="overflow-hidden rounded-2xl border border-[#e6e5e0] bg-[#fbfbfa] p-2 shadow-xs">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="/images/koy/01_koy_panoramik.jpg"
                  alt="Büyük Akören Köyü genel görünümü"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between gap-2 rounded-lg border border-white/25 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
                  <span className="truncate">Rakım 1.276 m • Sivas&apos;a 62 km</span>
                  <span className="shrink-0 font-mono text-[10px] text-white/85">
                    39°36′K 36°26′D
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-2 pt-2 pb-0.5 text-[11px] text-[#666560] sm:text-xs">
                <span>Büyükakören Köyü Genel Görünümü</span>
                <Link
                  href="/koyumuz"
                  className="font-medium text-[#191919] hover:underline"
                >
                  Köy Profili →
                </Link>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              <Link
                href="/duyurular"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#191919] px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#333333] sm:px-5 sm:text-sm"
              >
                <span>Duyuru & Haberler</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href="/faaliyetler"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#e6e5e0] bg-white px-3 py-2.5 text-xs font-medium text-[#191919] transition-colors hover:bg-[#fbfbfa] sm:px-5 sm:text-sm"
              >
                <span>Faaliyet Raporları</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Grid */}
      <section className="border-b border-[#e6e5e0] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#666560]">
              Hızlı Hizmet & Kısayollar
            </p>
            <span className="text-[11px] text-[#666560]">Tek dokunuşla erişim</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <Link
              href="/taziye"
              className="group flex flex-col justify-between rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-3.5 transition-all hover:border-[#cfcec8] hover:bg-white sm:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e5e0] bg-white text-[#191919]">
                  <HeartHandshake className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-[#191919] px-2 py-0.5 text-[10px] font-semibold text-white">
                  {publishedCondolences.length} ilan
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-[#191919] group-hover:underline sm:text-sm">
                  Taziye & Vefat İlanları
                </p>
                <p className="mt-0.5 text-[11px] text-[#666560]">
                  Cenaze ve defin vakitleri
                </p>
              </div>
            </Link>

            <Link
              href="/bagis"
              className="group flex flex-col justify-between rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-3.5 transition-all hover:border-[#cfcec8] hover:bg-white sm:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e5e0] bg-white text-[#191919]">
                  <Landmark className="h-4 w-4" />
                </span>
                <ChevronRight className="h-4 w-4 text-[#666560] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-[#191919] group-hover:underline sm:text-sm">
                  Aidat & Bağış IBAN
                </p>
                <p className="mt-0.5 text-[11px] text-[#666560]">
                  Tek tıkla resmî hesap
                </p>
              </div>
            </Link>

            <Link
              href="/koyumuz"
              className="group flex flex-col justify-between rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-3.5 transition-all hover:border-[#cfcec8] hover:bg-white sm:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e5e0] bg-white text-[#191919]">
                  <BookOpen className="h-4 w-4" />
                </span>
                <ChevronRight className="h-4 w-4 text-[#666560] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-[#191919] group-hover:underline sm:text-sm">
                  Köy Tarihçesi & Nüfus
                </p>
                <p className="mt-0.5 text-[11px] text-[#666560]">
                  1907&apos;den bugüne köyümüz
                </p>
              </div>
            </Link>

            <Link
              href="/iletisim"
              className="group flex flex-col justify-between rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-3.5 transition-all hover:border-[#cfcec8] hover:bg-white sm:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e5e0] bg-white text-[#191919]">
                  <Phone className="h-4 w-4" />
                </span>
                <ChevronRight className="h-4 w-4 text-[#666560] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-[#191919] group-hover:underline sm:text-sm">
                  Dernek & İletişim
                </p>
                <p className="mt-0.5 text-[11px] text-[#666560]">
                  Adres, harita ve talep formu
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Village Facts Strip */}
      <section className="border-b border-[#e6e5e0] bg-[#fbfbfa]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2.5 px-4 py-4 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-[#e6e5e0] sm:px-6 sm:py-0">
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-3.5 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-6 sm:py-5">
            <p className="text-[11px] font-medium text-[#666560] sm:text-xs">
              Tarihî Kayıt
            </p>
            <p className="mt-1 text-base font-semibold text-[#191919] sm:text-lg">
              1907 Ağören
            </p>
            <p className="text-[11px] text-[#666560] sm:text-xs">
              1928: Büyük Akviran
            </p>
          </div>
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-3.5 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-6 sm:py-5">
            <p className="text-[11px] font-medium text-[#666560] sm:text-xs">
              Merkeze Uzaklık
            </p>
            <p className="mt-1 text-base font-semibold text-[#191919] sm:text-lg">
              62 km / 49 km
            </p>
            <p className="text-[11px] text-[#666560] sm:text-xs">
              Sivas 62 km • Yıldızeli 49 km
            </p>
          </div>
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-3.5 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-6 sm:py-5">
            <p className="text-[11px] font-medium text-[#666560] sm:text-xs">
              Yerleşim Yapısı
            </p>
            <p className="mt-1 text-base font-semibold text-[#191919] sm:text-lg">
              3 Mahalle
            </p>
            <p className="text-[11px] text-[#666560] sm:text-xs">
              Yukarı, Aşağı, Şeyhler
            </p>
          </div>
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-3.5 sm:rounded-none sm:border-0 sm:bg-transparent sm:px-6 sm:py-5">
            <p className="text-[11px] font-medium text-[#666560] sm:text-xs">
              Nüfus & Rakım
            </p>
            <p className="mt-1 text-base font-semibold text-[#191919] sm:text-lg">
              614 Nüfus
            </p>
            <p className="text-[11px] text-[#666560] sm:text-xs">
              TÜİK 2021 • ~1.276 m
            </p>
          </div>
        </div>
      </section>

      {/* Latest Announcements & News */}
      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14">
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666560]">
              <Bell className="h-3.5 w-3.5" />
              Güncel Bildirimler
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#191919] sm:text-2xl">
              Duyurular, Haberler ve Açıklamalar
            </h2>
          </div>
          <Link
            href="/duyurular"
            className="shrink-0 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef] sm:border-0 sm:bg-transparent sm:p-0 sm:text-sm sm:text-[#666560]"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 md:grid-cols-3">
          {latestAnnouncements.map((post) => (
            <Link
              key={post.id}
              href={`/duyurular/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#e6e5e0] bg-white transition-all hover:border-[#cfcec8] hover:bg-[#fbfbfa] active:scale-[0.99]"
            >
              {post.image_url && (
                <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#e6e5e0] bg-[#f4f3ef]">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 text-xs text-[#666560]">
                  <span className="rounded-md bg-[#f4f3ef] px-2 py-0.5 font-medium text-[#191919]">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateTR(post.published_at)}
                  </span>
                </div>
                <h3 className="mt-2.5 text-base font-semibold leading-snug text-[#191919] group-hover:underline sm:mt-3">
                  {post.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed text-[#666560] sm:mt-2">
                  {post.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Activities & Condolences Split */}
      <section className="border-t border-[#e6e5e0] bg-[#fbfbfa]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-9 sm:gap-10 sm:px-6 sm:py-14 lg:grid-cols-12">
          {/* Faaliyet Raporları */}
          <div className="lg:col-span-7">
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666560]">
                  <FileText className="h-3.5 w-3.5" />
                  Şeffaf Raporlama
                </div>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#191919] sm:text-2xl">
                  Yapılan Çalışmalar & Faaliyetler
                </h2>
              </div>
              <Link
                href="/faaliyetler"
                className="shrink-0 rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef] sm:border-0 sm:bg-transparent sm:p-0 sm:text-sm sm:text-[#666560]"
              >
                Raporlar →
              </Link>
            </div>

            <div className="mt-4 space-y-3 sm:mt-5">
              {latestActivities.map((act) => (
                <Link
                  key={act.id}
                  href={`/duyurular/${act.slug}`}
                  className="group flex flex-col gap-3 rounded-xl border border-[#e6e5e0] bg-white p-3.5 transition-all hover:border-[#cfcec8] active:scale-[0.99] sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                  {act.image_url && (
                    <img
                      src={act.image_url}
                      alt={act.title}
                      className="aspect-[16/10] w-full shrink-0 rounded-lg border border-[#e6e5e0] object-cover sm:h-24 sm:w-36"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {act.project_status && (
                        <span className="rounded-md bg-[#f4f3ef] px-2 py-0.5 font-medium text-[#191919]">
                          {STATUS_LABELS[act.project_status]}
                        </span>
                      )}
                      <span className="text-[#666560]">
                        {formatDateTR(act.published_at)}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-[#191919] group-hover:underline">
                      {act.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-[#666560]">
                      {act.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Taziye Alanı */}
          <div className="lg:col-span-5">
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666560]">
                  <HeartHandshake className="h-3.5 w-3.5" />
                  Başsağlığı & Vefat
                </div>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#191919] sm:text-2xl">
                  Taziye Alanı
                </h2>
              </div>
              <Link
                href="/taziye"
                className="shrink-0 rounded-lg border border-[#e6e5e0] bg-white px-2.5 py-1 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef] sm:border-0 sm:bg-transparent sm:p-0 sm:text-sm sm:text-[#666560]"
              >
                Tümü →
              </Link>
            </div>

            <div className="mt-4 space-y-3 sm:mt-5">
              {latestCondolences.length === 0 ? (
                <div className="rounded-xl border border-[#e6e5e0] bg-white p-5 text-sm text-[#666560]">
                  Şu an yayında olan taziye ilanı bulunmamaktadır.
                </div>
              ) : (
                latestCondolences.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#e6e5e0] bg-white p-4 sm:p-5"
                  >
                    <p className="text-base font-semibold text-[#191919]">
                      {item.deceased_name}
                    </p>
                    {item.age_or_note && (
                      <p className="mt-0.5 text-xs text-[#666560]">
                        {item.age_or_note}
                      </p>
                    )}
                    <div className="mt-3 space-y-1 border-t border-[#e6e5e0] pt-3 text-xs text-[#666560]">
                      <p>
                        <strong className="font-medium text-[#191919]">
                          Defin / Vakit:
                        </strong>{" "}
                        {item.funeral_date}
                      </p>
                      <p>
                        <strong className="font-medium text-[#191919]">
                          Yer:
                        </strong>{" "}
                        {item.burial_place}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#666560]">
                      {item.message}
                    </p>
                  </div>
                ))
              )}

              {/* Quick IBAN & Contact Box */}
              <div className="rounded-xl border border-[#e6e5e0] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#666560]">
                    Aidat & Bağış IBAN
                  </span>
                  {settings.iban_number && (
                    <CopyIbanButton iban={settings.iban_number} />
                  )}
                </div>
                <p className="mt-2 break-all font-mono text-xs font-medium text-[#191919] sm:text-sm">
                  {settings.iban_number}
                </p>
                <p className="mt-1 text-xs text-[#666560]">
                  {settings.iban_bank} • {settings.iban_account_name}
                </p>
                {settings.show_association_phone && settings.association_phone && (
                  <div className="mt-3 flex items-center gap-2 border-t border-[#e6e5e0] pt-3 text-xs text-[#191919]">
                    <Phone className="h-3.5 w-3.5 text-[#666560]" />
                    <span>Dernek Tel: {settings.association_phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Preview Strip */}
      {data.gallery_photos.length > 0 && (
        <section className="border-t border-[#e6e5e0] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
                  Görsel Arşiv
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#191919] sm:text-2xl">
                  Köyümüzden Kareler
                </h2>
              </div>
              <Link
                href="/galeri"
                className="shrink-0 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-2.5 py-1 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef] sm:border-0 sm:bg-transparent sm:p-0 sm:text-sm sm:text-[#666560]"
              >
                Tüm Galeri ({data.gallery_photos.length}) →
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4">
              {data.gallery_photos
                .filter((p) => p.image_url !== "/images/koy/01_koy_panoramik.jpg")
                .slice(0, 4)
                .map((photo) => (
                  <Link
                    key={photo.id}
                    href="/galeri"
                    className="group overflow-hidden rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] transition-colors hover:border-[#cfcec8]"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="truncate px-3 py-2 text-xs font-medium text-[#191919] sm:py-2.5">
                      {photo.title}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
