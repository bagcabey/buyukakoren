"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Image as ImageIcon, Search, X } from "lucide-react";
import { GalleryPhoto } from "@/lib/types";

interface GalleryImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (photo: GalleryPhoto) => void;
  photos: GalleryPhoto[];
  selectedImageUrl?: string;
}

export function GalleryImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  photos,
  selectedImageUrl,
}: GalleryImagePickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("Tümü");

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const albums = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.album) set.add(p.album);
    });
    return ["Tümü", ...Array.from(set)];
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase("tr-TR");
    return photos.filter((p) => {
      const matchAlbum = selectedAlbum === "Tümü" || p.album === selectedAlbum;
      if (!matchAlbum) return false;
      if (!term) return true;
      const titleMatch = (p.title || "").toLocaleLowerCase("tr-TR").includes(term);
      const descMatch = (p.description || "").toLocaleLowerCase("tr-TR").includes(term);
      const albumMatch = (p.album || "").toLocaleLowerCase("tr-TR").includes(term);
      const yearMatch = (p.taken_year || "").includes(term);
      return titleMatch || descMatch || albumMatch || yearMatch;
    });
  }, [photos, searchTerm, selectedAlbum]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-picker-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[#e6e5e0] bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e6e5e0] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f3ef] text-[#191919]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 id="gallery-picker-title" className="text-base font-bold text-[#191919]">
                Galeriden Görsel Seç
              </h2>
              <p className="text-xs text-[#666560]">
                Mevcut albümlerden {photos.length} adet fotoğraf listeleniyor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e6e5e0] p-1.5 text-[#666560] transition hover:bg-[#f4f3ef] hover:text-[#191919]"
            title="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="border-b border-[#e6e5e0] bg-[#fbfbfa] p-4 space-y-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#888780]" />
              <input
                type="text"
                placeholder="Görsel adı, albüm veya yıl ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#e6e5e0] bg-white py-2 pr-3 pl-9 text-xs focus:border-[#191919] focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-xs text-[#888780] hover:text-[#191919]"
                >
                  Temizle
                </button>
              )}
            </div>
            <span className="text-xs text-[#666560]">
              {filteredPhotos.length} fotoğraf bulundu
            </span>
          </div>

          {/* Album Pills */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {albums.map((alb) => (
              <button
                key={alb}
                type="button"
                onClick={() => setSelectedAlbum(alb)}
                className={`whitespace-nowrap rounded-md px-3 py-1 font-medium transition ${
                  selectedAlbum === alb
                    ? "bg-[#191919] text-white"
                    : "border border-[#e6e5e0] bg-white text-[#666560] hover:bg-[#f4f3ef] hover:text-[#191919]"
                }`}
              >
                {alb}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Grid Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#666560]">
              <ImageIcon className="h-10 w-10 text-[#dcdbd5]" />
              <p className="mt-3 text-sm font-semibold text-[#191919]">
                Eşleşen fotoğraf bulunamadı
              </p>
              <p className="mt-1 text-xs text-[#666560]">
                Farklı bir arama terimi deneyin veya albüm filtresini değiştirin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {filteredPhotos.map((photo) => {
                const isSelected = selectedImageUrl === photo.image_url;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      onSelect(photo);
                      onClose();
                    }}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-all hover:shadow-md ${
                      isSelected
                        ? "border-[#191919] ring-2 ring-[#191919]"
                        : "border-[#e6e5e0] bg-[#fbfbfa] hover:border-[#191919]"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f4f3ef]">
                      <img
                        src={photo.image_url}
                        alt={photo.image_alt || photo.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#191919] text-white shadow-md">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                        {photo.album}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-1 flex-col justify-between p-2.5">
                      <div>
                        <p className="line-clamp-1 text-xs font-semibold text-[#191919]">
                          {photo.title}
                        </p>
                        {photo.taken_year && (
                          <p className="mt-0.5 text-[11px] text-[#666560]">
                            Yıl: {photo.taken_year}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`mt-2 w-full rounded-md py-1 text-center text-[11px] font-medium transition ${
                          isSelected
                            ? "bg-[#191919] text-white"
                            : "border border-[#e6e5e0] bg-white text-[#191919] group-hover:bg-[#191919] group-hover:text-white"
                        }`}
                      >
                        {isSelected ? "Seçili Görsel" : "Bu Görseli Seç"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#e6e5e0] bg-[#fbfbfa] px-5 py-3">
          <p className="text-xs text-[#666560]">
            Bir fotoğrafa tıklayarak anında kapak görseli yapabilirsiniz.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#e6e5e0] bg-white px-4 py-1.5 text-xs font-medium text-[#191919] hover:bg-[#f4f3ef]"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
