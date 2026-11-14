"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";
import { GalleryPhoto } from "@/lib/types";

export function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const albums = ["Tümü", ...Array.from(new Set(photos.map((p) => p.album)))];
  const [activeAlbum, setActiveAlbum] = useState("Tümü");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filtered =
    activeAlbum === "Tümü"
      ? photos
      : photos.filter((p) => p.album === activeAlbum);

  useEffect(() => {
    if (selectedIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight")
        setSelectedIndex((i) =>
          i === null ? null : (i + 1) % filtered.length
        );
      if (e.key === "ArrowLeft")
        setSelectedIndex((i) =>
          i === null ? null : (i - 1 + filtered.length) % filtered.length
        );
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, filtered.length]);

  const current = selectedIndex !== null ? filtered[selectedIndex] : null;

  return (
    <div>
      {/* Album Filter Tabs */}
      <div className="no-scrollbar mt-5 flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {albums.map((album) => {
          const count =
            album === "Tümü"
              ? photos.length
              : photos.filter((p) => p.album === album).length;
          const active = activeAlbum === album;
          return (
            <button
              key={album}
              type="button"
              onClick={() => {
                setActiveAlbum(album);
                setSelectedIndex(null);
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5 ${
                active
                  ? "border-[#191919] bg-[#191919] text-white"
                  : "border-[#e6e5e0] bg-[#fbfbfa] text-[#666560] hover:text-[#191919]"
              }`}
            >
              <span>{album}</span>
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-10 text-center text-sm text-[#666560]">
          <Images className="mx-auto mb-2 h-6 w-6 text-[#666560]" />
          Bu albümde henüz fotoğraf bulunmuyor.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className="group overflow-hidden rounded-xl border border-[#e6e5e0] bg-white text-left transition-colors hover:border-[#cfcec8] hover:bg-[#fbfbfa]"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#f4f3ef]">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#191919]">
                    {photo.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#666560]">{photo.album}</p>
                </div>
                {photo.taken_year && (
                  <span className="shrink-0 rounded bg-[#f4f3ef] px-2 py-0.5 text-xs text-[#666560]">
                    {photo.taken_year}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {current && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-[#191919] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{current.title}</p>
                <p className="text-xs text-white/60">
                  {current.album}
                  {current.taken_year ? ` • ${current.taken_year}` : ""} •{" "}
                  {selectedIndex + 1} / {filtered.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex max-h-[75vh] items-center justify-center bg-black">
              <img
                src={current.image_url}
                alt={current.title}
                className="max-h-[75vh] w-auto object-contain"
              />
              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIndex(
                        (selectedIndex - 1 + filtered.length) % filtered.length
                      )
                    }
                    className="absolute left-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/85"
                    aria-label="Önceki"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIndex((selectedIndex + 1) % filtered.length)
                    }
                    className="absolute right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/85"
                    aria-label="Sonraki"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
