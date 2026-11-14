import {
  Building2,
  Compass,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { getAllStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function IletisimPage() {
  const data = await getAllStoreData();
  const s = data.site_settings;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Ulaşım & Kanallar
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          İletişim ve Köy Resmî Kanalları
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Köy muhtarlığı, resmi birimler ve dernek yönetimi iletişim kanalları.
        </p>

        {/* Quick Mobile/Desktop One-Tap Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://www.google.com/maps/search/?api=1&query=39.603056,36.438056"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#191919] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#333333]"
          >
            <Compass className="h-3.5 w-3.5" />
            Google Haritalar&apos;da Yol Tarifi Al
          </a>
          {s.association_email && (
            <a
              href={`mailto:${s.association_email}`}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3.5 py-2 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
            >
              <Mail className="h-3.5 w-3.5 text-[#666560]" />
              E-posta Gönder
            </a>
          )}
          <a
            href="tel:112"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#e6e5e0] bg-white px-3.5 py-2 text-xs font-medium text-[#191919] hover:bg-[#fbfbfa]"
          >
            <Phone className="h-3.5 w-3.5 text-red-600" />
            112 Acil Çağrı
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-12 lg:gap-8">
        {/* Left: Official Channels */}
        <div className="space-y-4 lg:col-span-5">
          {/* Village Mukhtar */}
          <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666560]">
              <Building2 className="h-4 w-4" />
              Köy Muhtarlığı
            </div>
            <p className="mt-2 text-base font-semibold text-[#191919]">
              Büyükakören Köyü Muhtarlığı
            </p>
            <p className="mt-1 text-xs text-[#666560]">
              Köy içi resmî iş ve işlemler için köy muhtarlığı kanalı.
            </p>
            {s.mukhtar_phone ? (
              <a
                href={`tel:${s.mukhtar_phone.replace(/\s+/g, "")}`}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm font-medium text-[#191919] hover:bg-[#f4f3ef]"
              >
                <Phone className="h-4 w-4 text-[#666560]" />
                <span>{s.mukhtar_phone}</span>
              </a>
            ) : (
              <p className="mt-2 text-xs text-[#666560]">
                Muhtarlık iletişim numarası yönetici panelinden isteğe bağlı olarak eklenebilir.
              </p>
            )}
          </div>

          {/* Association Contact */}
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#191919]">
              Dernek İletişim Bilgileri
            </h2>
            <div className="mt-3 space-y-2.5 text-sm text-[#666560]">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#666560]" />
                <span>{s.association_address || "Büyükakören Köyü, Yıldızeli / Sivas"}</span>
              </div>
              {s.association_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[#666560]" />
                  <a
                    href={`mailto:${s.association_email}`}
                    className="hover:text-[#191919] hover:underline"
                  >
                    {s.association_email}
                  </a>
                </div>
              )}
              {s.show_association_phone && s.association_phone && (
                <div className="flex items-center gap-2 text-[#191919]">
                  <Phone className="h-4 w-4 shrink-0 text-[#666560]" />
                  <a
                    href={`tel:${s.association_phone.replace(/\s+/g, "")}`}
                    className="font-medium hover:underline"
                  >
                    {s.association_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Official Regional Channels */}
          <div className="rounded-xl border border-[#e6e5e0] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#666560]">
              <ShieldAlert className="h-4 w-4" />
              Resmî & Acil Birimler
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[#666560]">
              <li className="flex justify-between border-b border-[#e6e5e0] pb-2">
                <span>Acil Çağrı (Jandarma / Sağlık / İtfaiye)</span>
                <a href="tel:112" className="font-semibold text-[#191919] underline">
                  112
                </a>
              </li>
              <li className="flex justify-between border-b border-[#e6e5e0] pb-2">
                <span>T.C. Yıldızeli Kaymakamlığı</span>
                <a
                  href="https://www.yildizeli.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#191919] underline"
                >
                  yildizeli.gov.tr
                </a>
              </li>
              <li className="flex justify-between">
                <span>T.C. Sivas Valiliği</span>
                <a
                  href="https://www.sivas.gov.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#191919] underline"
                >
                  sivas.gov.tr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5 sm:p-8 lg:col-span-7">
          <h2 className="text-xl font-semibold text-[#191919]">
            Derneğe Mesaj / Talep İletin
          </h2>
          <p className="mt-1 mb-5 text-sm text-[#666560] sm:mb-6">
            Görüş, öneri, üyelik veya duyuru taleplerinizi buradan doğrudan
            yönetici paneline gönderebilirsiniz.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
