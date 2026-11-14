import { CheckCircle2, Info, Landmark } from "lucide-react";
import { CopyIbanButton } from "@/components/CopyIbanButton";
import { getAllStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    step: "1",
    title: "IBAN'ı Kopyalayın",
    desc: "Yukarıdaki \"Kopyala\" butonuna dokunarak resmî dernek IBAN numarasını panonuza kopyalayın.",
  },
  {
    step: "2",
    title: "Alıcı Adını Yazın",
    desc: "Banka uygulamanızda alıcı adı bölümüne derneğimizin tam unvanını eksiksiz şekilde girin.",
  },
  {
    step: "3",
    title: "Açıklama Ekleyin",
    desc: "Dekont açıklama kısmına Ad-Soyad ve \"Üye Aidatı\" veya \"Köy Projesi Bağışı\" notunu ekleyin.",
  },
];

export default async function BagisPage() {
  const data = await getAllStoreData();
  const s = data.site_settings;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Dayanışma & Destek
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          Bağış ve Üye Aidatı Bilgileri
        </h1>
        <p className="mt-2 text-sm text-[#666560]">
          Derneğimizin köy içi projeleri, çevre düzenlemesi ve öğrenci
          etkinlikleri için resmî banka hesap bilgileri.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 sm:mt-8 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#191919]">
            <Landmark className="h-4 w-4 text-[#666560]" />
            Resmî Dernek Hesabı
          </div>
          {s.iban_number && <CopyIbanButton iban={s.iban_number} />}
        </div>

        <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
          <div className="rounded-lg border border-[#e6e5e0] bg-white p-4">
            <p className="text-xs text-[#666560]">IBAN Numarası</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold tracking-wide text-[#191919] sm:text-lg">
              {s.iban_number || "Henüz tanımlanmadı"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-lg border border-[#e6e5e0] bg-white p-4">
              <p className="text-xs text-[#666560]">Alıcı / Hesap Adı</p>
              <p className="mt-1 text-sm font-medium text-[#191919]">
                {s.iban_account_name || s.association_name}
              </p>
            </div>
            <div className="rounded-lg border border-[#e6e5e0] bg-white p-4">
              <p className="text-xs text-[#666560]">Banka</p>
              <p className="mt-1 text-sm font-medium text-[#191919]">
                {s.iban_bank || "—"}
              </p>
            </div>
          </div>
        </div>

        {s.donation_note && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#e6e5e0] bg-white p-4 text-xs leading-relaxed text-[#666560] sm:mt-6">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#191919]" />
            <p>{s.donation_note}</p>
          </div>
        )}
      </div>

      {/* Step-by-Step Guide */}
      <section className="mt-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#666560]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Adım Adım Rehber
        </div>
        <h2 className="mt-1 text-lg font-semibold text-[#191919] sm:text-xl">
          Nasıl Bağış ve Aidat Gönderilir?
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-[#e6e5e0] bg-white p-4"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#191919] text-xs font-semibold text-white">
                {item.step}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-[#191919]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#666560]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
