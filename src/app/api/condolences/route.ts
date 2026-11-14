import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createCondolence,
  deleteCondolence,
  getAllStoreData,
} from "@/lib/store";

export async function GET() {
  const data = await getAllStoreData();
  return NextResponse.json({ condolences: data.condolences });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const body = (await req.json()) as {
    id?: string;
    deceased_name: string;
    age_or_note?: string;
    funeral_date: string;
    burial_place: string;
    message: string;
    relatives?: string;
    is_published?: boolean;
  };
  if (!body.deceased_name?.trim() || !body.funeral_date?.trim()) {
    return NextResponse.json(
      { error: "Vefat eden adı ve cenaze tarihi zorunludur." },
      { status: 400 }
    );
  }
  const created = await createCondolence({
    id: body.id,
    deceased_name: body.deceased_name.trim(),
    age_or_note: body.age_or_note?.trim() || null,
    funeral_date: body.funeral_date.trim(),
    burial_place: body.burial_place?.trim() || "Büyük Akören Köyü Mezarlığı",
    message:
      body.message?.trim() ||
      "Merhuma/Merhumeye Allah'tan rahmet, kederli ailesine başsağlığı dileriz.",
    relatives: body.relatives?.trim() || null,
    is_published: body.is_published !== false,
  });
  return NextResponse.json({ condolence: created });
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
  await deleteCondolence(id);
  return NextResponse.json({ ok: true });
}
