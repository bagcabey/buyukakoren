import {
  BookOpen,
  Check,
  FileSpreadsheet,
  HeartHandshake,
  Shield,
  Sprout,
  Users,
} from "lucide-react";
import { getAllStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const ACTIVITY_AREAS = [
  {
    icon: BookOpen,
    title: "Eğitim & Gençlik",
    desc: "Köy okulumuzdaki öğrencilerimiz için kültür gezileri, okul ihtiyaçları ve eğitime destek çalışmaları.",
  },
  {
    icon: Sprout,
    title: "Çevre & Ağaçlandırma",
    desc: "Köy genelinde fidan dikimi, mezarlık bakımı ve ortak yaşam alanlarının imece usulü temizliği.",
  },
  {
    icon: HeartHandshake,
    title: "Sosyal Dayanışma & Taziye",
    desc: "Köydeki ve gurbetteki hemşehrilerimiz arasında birlik beraberlik ve hızlı taziye iletişimi.",
  },
  {
    icon: FileSpreadsheet,
    title: "Şeffaf Mali Raporlama",
    desc: "Toplanan aidat ve bağışların köy projelerinde nasıl değerlendirildiğini düzenli raporlama.",
  },
];

export default async function DernekPage() {
  const data = await getAllStoreData();
  const { site_settings: settings, board_members: members } = data;

  const sortedMembers = [...members].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <div className="border-b border-[#e6e5e0] pb-5 sm:pb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Kurumsal Kimlik
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#191919] sm:text-3xl">
          {settings.association_name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#666560]">
          Köyümüzün sosyal, kültürel ve altyapısal dayanışmasını güçlendirmek,
          gurbetteki ve köydeki hemşehrilerimizi bir araya getirmek amacıyla
          faaliyet göstermektedir.
        </p>
      </div>

      {/* Mission & Principles */}
      <div className="mt-6 grid gap-5 sm:mt-8 md:grid-cols-2 md:gap-6">
        <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#191919]">
            <Shield className="h-4 w-4 text-[#666560]" />
            Amacımız ve İlkelerimiz
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-[#666560]">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#191919]" />
              Köyümüzün ortak ihtiyaçlarını şeffaf raporlama ile çözüme
              kavuşturmak.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#191919]" />
              Öğrencilerimize eğitim, kültür gezileri ve sosyal destek sağlamak.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#191919]" />
              Ağaçlandırma, mezarlık bakımı ve çevre temizliği gibi imece
              çalışmalarını sürdürmek.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#191919]" />
              Acil durum ve taziye ilanlarını tüm hemşehrilere hızla ulaştırmak.
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-[#e6e5e0] bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#191919]">
            Kurumsal Bilgiler
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-[#666560]">Dernek Adı</dt>
              <dd className="font-medium text-[#191919]">
                {settings.association_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#666560]">Merkez / Bölge</dt>
              <dd className="font-medium text-[#191919]">
                {settings.association_address || "Büyükakören Köyü, Yıldızeli / Sivas"}
              </dd>
            </div>
            {settings.association_email && (
              <div>
                <dt className="text-xs text-[#666560]">Resmî E-posta</dt>
                <dd className="font-medium text-[#191919]">
                  {settings.association_email}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Activity Areas */}
      <div className="mt-10">
        <p className="text-xs font-medium uppercase tracking-wider text-[#666560]">
          Çalışma Çerçevesi
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#191919] sm:text-2xl">
          Dernek Faaliyet Alanlarımız ve Çalışma İlkelerimiz
        </h2>
        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITY_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <div
                key={area.title}
                className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 sm:p-5"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6e5e0] bg-white text-[#191919]">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-[#191919]">
                  {area.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#666560]">
                  {area.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board Members */}
      <div className="mt-10 sm:mt-12">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#666560]">
          <Users className="h-3.5 w-3.5" />
          Yönetim
        </div>
        <h2 className="mt-1 text-xl font-semibold text-[#191919] sm:text-2xl">
          Yönetim Kurulu
        </h2>

        <div className="mt-5 grid gap-3.5 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {sortedMembers.map((member, index) => (
            <div
              key={member.id}
              className="rounded-xl border border-[#e6e5e0] bg-white p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#191919] text-xs font-semibold text-white">
                    {getInitials(member.full_name)}
                  </span>
                  <span className="inline-block rounded-md bg-[#f4f3ef] px-2.5 py-0.5 text-xs font-medium text-[#191919]">
                    {member.role}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-medium text-[#666560]">
                  #{String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#191919]">
                {member.full_name}
              </h3>
              {member.bio && (
                <p className="mt-1.5 text-xs leading-relaxed text-[#666560] sm:text-sm">
                  {member.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
