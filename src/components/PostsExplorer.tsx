"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Pin, Search } from "lucide-react";
import { CATEGORY_LABELS, formatDateTR } from "@/lib/format";
import { Post, PostCategory } from "@/lib/types";

const FILTERS: { key: string; label: string }[] = [
  { key: "tumu", label: "Tümü" },
  { key: "duyuru", label: "Duyurular" },
  { key: "haber", label: "Haberler" },
  { key: "aciklama", label: "Resmî Açıklamalar" },
  { key: "faaliyet", label: "Faaliyetler" },
];

export function PostsExplorer({
  posts,
  initialCategory = "tumu",
}: {
  posts: Post[];
  initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");

  const filtered = posts.filter((p) => {
    const catOk =
      category === "tumu" || p.category === (category as PostCategory);
    const q = query.trim().toLowerCase();
    const qOk =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q);
    return catOk && qOk;
  });

  return (
    <div>
      <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {FILTERS.map((f) => {
            const active = category === f.key;
            const count =
              f.key === "tumu"
                ? posts.length
                : posts.filter((p) => p.category === f.key).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setCategory(f.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5 ${
                  active
                    ? "border-[#191919] bg-[#191919] text-white"
                    : "border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[#f4f3ef] text-[#666560]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-[#666560]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Duyuru veya haber ara..."
            className="w-full rounded-lg border border-[#e6e5e0] bg-white py-2 pr-3 pl-9 text-xs text-[#191919] outline-none focus:border-[#191919]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-8 text-center text-sm text-[#666560]">
          Arama veya filtre kriterlerine uygun içerik bulunamadı.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/duyurular/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#e6e5e0] bg-white transition-colors hover:border-[#cfcec8] hover:bg-[#fbfbfa]"
            >
              {post.image_url && (
                <div className="aspect-[16/9] w-full overflow-hidden border-b border-[#e6e5e0] bg-[#f4f3ef]">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 text-xs text-[#666560]">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-[#f4f3ef] px-2 py-0.5 font-medium text-[#191919]">
                      {CATEGORY_LABELS[post.category]}
                    </span>
                    {post.is_pinned && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-[#191919] px-1.5 py-0.5 text-[11px] font-medium text-white">
                        <Pin className="h-2.5 w-2.5" />
                        Sabit
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDateTR(post.published_at)}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-semibold leading-snug text-[#191919] group-hover:underline">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[#666560]">
                  {post.summary}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
