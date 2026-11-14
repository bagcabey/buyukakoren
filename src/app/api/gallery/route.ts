import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createGalleryPhoto,
  deleteGalleryPhoto,
  getAllStoreData,
} from "@/lib/store";

export async function GET() {
  const data = await getAllStoreData();
  return NextResponse.json({ gallery_photos: data.gallery_photos });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const body = (await req.json()) as {
    id?: string;
    title: string;
    album: string;
    image_url: string;
    taken_year?: string;
  };
  if (!body.title?.trim() || !body.image_url?.trim()) {
    return NextResponse.json(
      { error: "Başlık ve görsel adresi zorunludur." },
      { status: 400 }
    );
  }
  const created = await createGalleryPhoto({
    id: body.id,
    title: body.title.trim(),
    album: body.album?.trim() || "Köyümüzden Kareler",
    image_url: body.image_url.trim(),
    taken_year: body.taken_year?.trim() || null,
  });
  return NextResponse.json({ photo: created });
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
  }
  await deleteGalleryPhoto(id);
  return NextResponse.json({ ok: true });
}
