"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: "idle" | "uploading" | "success" | "error";
  errorMsg?: string;
}

interface BatchGalleryUploaderProps {
  album: string;
  year: string;
  author: string;
  license: string;
  expectedVersion?: number;
  onUploadComplete: () => Promise<void>;
  notify: (msg: string, err?: boolean) => void;
}

export function BatchGalleryUploader({
  album,
  year,
  author,
  license,
  expectedVersion,
  onUploadComplete,
  notify,
}: BatchGalleryUploaderProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<QueuedFile[]>([]);
  queueRef.current = queue;

  // Clean up object URLs on unmount only to avoid premature revocation during uploads
  useEffect(() => {
    return () => {
      queueRef.current.forEach((q) => URL.revokeObjectURL(q.previewUrl));
    };
  }, []);

  function handleAddFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: QueuedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      newItems.push({
        id: `file-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "idle",
      });
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleAddFiles(e.dataTransfer.files);
  }

  function handleRemoveFromQueue(id: string) {
    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function clearCompleted() {
    setQueue((prev) => {
      const remaining = prev.filter((item) => item.status !== "success");
      const completed = prev.filter((item) => item.status === "success");
      completed.forEach((c) => URL.revokeObjectURL(c.previewUrl));
      return remaining;
    });
  }

  async function handleStartBatchUpload() {
    const pendingItems = queue.filter(
      (item) => item.status === "idle" || item.status === "error"
    );
    if (pendingItems.length === 0) {
      notify("Yüklenecek bekleyen fotoğraf yok.", true);
      return;
    }

    setIsProcessing(true);
    setUploadedCount(0);
    let successCounter = 0;

    for (const item of pendingItems) {
      // Mark current as uploading
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: "uploading" } : q))
      );

      try {
        // Step 1: Upload to /api/upload
        const fd = new FormData();
        fd.append("file", item.file);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!upRes.ok) {
          throw new Error("Görsel sunucuya yüklenemedi.");
        }
        const upJson = (await upRes.json()) as { url: string };
        const uploadedUrl = upJson.url;

        // Auto clean file title from filename: e.g. "koy-okulu-2026.jpg" -> "Köy Okulu 2026"
        const cleanTitle = item.file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]+/g, " ")
          .split(" ")
          .filter(Boolean)
          .map(
            (w) =>
              w.charAt(0).toLocaleUpperCase("tr-TR") +
              w.slice(1).toLocaleLowerCase("tr-TR")
          )
          .join(" ");

        // Step 2: Create Gallery record in /api/gallery
        // For appending new gallery photos in batch, omit expected_version to avoid VersionConflictError (409) on photos 2+
        const galRes = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: cleanTitle,
            album: album || "Köyümüzden Kareler",
            image_url: uploadedUrl,
            image_alt: cleanTitle,
            taken_year: year || "2026",
            attribution_author: author || "",
            attribution_license: license || "",
          }),
        });

        if (!galRes.ok) {
          throw new Error("Galeri kaydı oluşturulamadı.");
        }

        successCounter += 1;
        setUploadedCount(successCounter);

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "success" } : q
          )
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Yükleme hatası";
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "error", errorMsg } : q
          )
        );
      }
    }

    setIsProcessing(false);
    if (successCounter > 0) {
      await onUploadComplete();
      notify(`${successCounter} fotoğraf başarıyla albüme eklendi.`);
    }
  }

  const idleCount = queue.filter(
    (q) => q.status === "idle" || q.status === "error"
  ).length;
  const completedCount = queue.filter((q) => q.status === "success").length;
  const totalCount = queue.length;
  const progressPercent = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#191919]">
            Çoklu Fotoğraf Yükleme (Toplu Galeri / Batch Upload)
          </h3>
          <p className="text-xs text-[#666560]">
            Birden fazla fotoğrafı tek seferde seçip seçili &quot;{album}&quot; albümüne yükleyin
          </p>
        </div>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={clearCompleted}
            className="text-xs text-[#666560] hover:text-[#191919] underline"
          >
            Yüklenenleri Temizle ({completedCount})
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-[#191919] bg-stone-100"
            : "border-[#d8d7d1] bg-white hover:border-[#191919] hover:bg-[#faf9f7]"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f3ef] text-[#191919]">
          <Upload className="h-6 w-6 text-[#191919]" />
        </div>
        <p className="mt-2 text-xs font-semibold text-[#191919]">
          Fotoğrafları buraya sürükleyip bırakın veya seçmek için tıklayın
        </p>
        <p className="mt-1 text-[11px] text-[#666560]">
          PNG, JPG, WebP veya GIF • Birden fazla dosya seçimi desteklenir
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleAddFiles(e.target.files);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      </div>

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#191919]">
              Seçilen Dosyalar ({queue.length})
            </span>
            <span className="text-[#666560]">
              {completedCount} tamamlandı, {idleCount} bekliyor
            </span>
          </div>

          {/* Progress Bar (during batch) */}
          {isProcessing && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#191919] font-medium flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Fotoğraflar yükleniyor ({uploadedCount} / {totalCount})...
                </span>
                <span className="font-mono text-[#666560]">%{progressPercent}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e6e5e0]">
                <div
                  className="h-full bg-[#191919] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Queue Item Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 max-h-[340px] overflow-y-auto p-1">
            {queue.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col overflow-hidden rounded-lg border border-[#e6e5e0] bg-white p-2"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded bg-stone-100">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                  {item.status === "success" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/60 text-white">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {item.status === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 text-white">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                <div className="mt-2 flex flex-1 items-start justify-between gap-1 text-[11px]">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#191919]" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-[#666560]">
                      {(item.file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  {item.status === "idle" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFromQueue(item.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      title="Kaldır"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {idleCount > 0 && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartBatchUpload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#191919] py-2.5 text-xs font-semibold text-white transition hover:bg-[#333333] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yükleniyor... ({uploadedCount} / {totalCount})
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {idleCount} Fotoğrafı Yükle ve &quot;{album}&quot; Albümüne Kaydet
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
