import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdminAuth } from "@/lib/auth";
import { appendAuditLog } from "@/lib/security-store";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB

type DetectedFileKind = "jpeg" | "png" | "webp" | "pdf";

function detectMagicBytes(buf: Buffer): DetectedFileKind | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "png";
  }

  // WebP: RIFF....WEBP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  // PDF: %PDF-
  if (buf.toString("ascii", 0, 5) === "%PDF-") {
    return "pdf";
  }

  return null;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("type") as string) || "image";
    const folder = rawFolder === "doc" ? "doc" : "image";

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const detected = detectMagicBytes(inputBuffer);

    if (!detected) {
      return NextResponse.json(
        {
          error:
            "Güvenlik doğrulaması başarısız: Yalnızca geçerli JPEG, PNG, WebP görseller ve PDF belgeleri yüklenebilir (SVG/HTML/komut dosyalarına izin verilmez).",
        },
        { status: 400 }
      );
    }

    if (detected === "pdf") {
      if (inputBuffer.length > MAX_PDF_BYTES) {
        return NextResponse.json(
          { error: "PDF dosya boyutu 15 MB sınırını aşamaz." },
          { status: 413 }
        );
      }
    } else {
      if (inputBuffer.length > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Görsel dosya boyutu 8 MB sınırını aşamaz." },
          { status: 413 }
        );
      }
    }

    const baseName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "dosya";

    let finalBuffer: Buffer;
    let finalExt: string;
    let finalMime: string;

    if (detected === "pdf") {
      finalBuffer = inputBuffer;
      finalExt = "pdf";
      finalMime = "application/pdf";
    } else {
      // EXIF yönlendirmesini düzelt, uzun kenarı max 2000px yap ve WebP'ye dönüştür
      finalBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
      finalExt = "webp";
      finalMime = "image/webp";
    }

    const filename = `${Date.now()}-${baseName}.${finalExt}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${folder}/${filename}`, finalBuffer, {
        access: "public",
        contentType: finalMime,
        addRandomSuffix: true,
      });

      await appendAuditLog({
        username: auth.session.sub,
        role: auth.session.role,
        action: "upload.create",
        target: blob.pathname,
        detail: `${finalMime} (${Math.round(finalBuffer.length / 1024)} KB)`,
      });

      return NextResponse.json({
        url: blob.url,
        name: file.name,
        mime: finalMime,
        size: finalBuffer.length,
      });
    }

    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        {
          error:
            "Dosya depolama yapılandırması (BLOB_READ_WRITE_TOKEN) sunucuda eksik.",
        },
        { status: 503 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const targetPath = path.join(uploadDir, filename);
    fs.writeFileSync(targetPath, finalBuffer);

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "upload.create",
      target: `/uploads/${folder}/${filename}`,
      detail: `${finalMime} (${Math.round(finalBuffer.length / 1024)} KB)`,
    });

    return NextResponse.json({
      url: `/uploads/${folder}/${filename}`,
      name: file.name,
      mime: finalMime,
      size: finalBuffer.length,
    });
  } catch (err) {
    console.error("[upload] Dosya yükleme hatası:", err);
    return NextResponse.json(
      { error: "Dosya işlenirken veya yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
