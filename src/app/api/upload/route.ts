import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const ext = path.extname(file.name) || ".jpg";
    const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 6)}${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`uploads/${safeName}`, buffer, {
        access: "public",
        addRandomSuffix: false,
        contentType: mimeType,
      });
      return NextResponse.json({ url: blob.url });
    }

    if (!process.env.VERCEL) {
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, safeName), buffer);
        return NextResponse.json({ url: `/uploads/${safeName}` });
      } catch {
        // Salt okunur dosya sisteminde Data URL fallback'i kullan
      }
    }

    const base64 = buffer.toString("base64");
    return NextResponse.json({ url: `data:${mimeType};base64,${base64}` });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Yükleme başarısız." },
      { status: 500 }
    );
  }
}
