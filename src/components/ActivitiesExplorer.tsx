"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, CheckCircle2, Clock, FileText } from "lucide-react";
import { STATUS_LABELS, formatDateTR } from "@/lib/format";
import { Post } from "@/lib/types";
import { SmartImage } from "./SmartImage";

export function ActivitiesExplorer({ activities }: { activities: Post[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("tumu");

  const doneCount = activities.filter(
    (a) => a.project_status === "tamamlandi"
  ).length;
  const activeCount = activities.filter(
    (a) => a.project_status === "devam_ediyor"
  ).length;
  const plannedCount = activities.filter(
    (a) => a.project_status === "planlandi"
  ).length;

  const filtered =
    statusFilter === "tumu"
      ? activities
      : activities.filter((a) => a.project_status === statusFilter);

  return (
    <div>
      {/* Summary Cards */}
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:grid-cols-4 sm:gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter("tumu")}
          className={`rounded-xl border p-3.5 text-left transition-colors sm:p-4 ${
            statusFilter === "tumu"
              ? "border-[#191919] bg-[#191919] text-white"
              : "border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] hover:border-[#cfcec8]"
          }`}
        >
          <p className="text-[11px] opacity-75 sm:text-xs">Toplam Çalışma</p>
          <p className="mt-1 text-xl font-semibold sm:text-2xl">{activities.length}</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("tamamlandi")}
          className={`rounded-xl border p-3.5 text-left transition-colors sm:p-4 ${
            statusFilter === "tamamlandi"
              ? "border-[#191919] bg-[#191919] text-white"
              : "border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] hover:border-[#cfcec8]"
          }`}
        >
          <p className="text-[11px] opacity-75 sm:text-xs">Tamamlanan</p>
          <p className="mt-1 text-xl font-semibold sm:text-2xl">{doneCount}</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("devam_ediyor")}
          className={`rounded-xl border p-3.5 text-left transition-colors sm:p-4 ${
            statusFilter === "devam_ediyor"
              ? "border-[#191919] bg-[#191919] text-white"
              : "border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] hover:border-[#cfcec8]"
          }`}
        >
          <p className="text-[11px] opacity-75 sm:text-xs">Devam Eden</p>
          <p className="mt-1 text-xl font-semibold sm:text-2xl">{activeCount}</p>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("planlandi")}
          className={`rounded-xl border p-3.5 text-left transition-colors sm:p-4 ${
            statusFilter === "planlandi"
              ? "border-[#191919] bg-[#191919] text-white"
              : "border-[#e6e5e0] bg-[#fbfbfa] text-[#191919] hover:border-[#cfcec8]"
          }`}
        >
          <p className="text-[11px] opacity-75 sm:text-xs">Planlanan</p>
          <p className="mt-1 text-xl font-semibold sm:text-2xl">{plannedCount}</p>
        </button>
      </div>

      {/* Activity List */}
      <div className="mt-8 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-8 text-center text-sm text-[#666560]">
            Bu durumda kayıtlı faaliyet raporu bulunmamaktadır.
          </div>
        ) : (
          filtered.map((item) => (
            <Link
              key={item.id}
              href={`/duyurular/${item.slug}`}
              className="group flex flex-col gap-5 rounded-xl border border-[#e6e5e0] bg-white p-5 transition-colors hover:border-[#cfcec8] hover:bg-[#fbfbfa] md:flex-row md:items-center"
            >
              {item.image_url && (
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-[#e6e5e0] bg-[#f4f3ef] md:w-64">
                  <SmartImage
                    src={item.image_url}
                    alt={item.image_alt || item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 256px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {item.project_status && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#f4f3ef] px-2.5 py-0.5 font-medium text-[#191919]">
                      {item.project_status === "tamamlandi" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-amber-700" />
                      )}
                      {STATUS_LABELS[item.project_status]}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[#666560]">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDateTR(item.published_at)}
                  </span>
                </div>
                <h2 className="mt-2.5 text-xl font-semibold text-[#191919] group-hover:underline">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#666560]">
                  {item.summary}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#191919]">
                  <FileText className="h-3.5 w-3.5" />
                  Detaylı Raporu Oku →
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
