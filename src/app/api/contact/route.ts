import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createContactMessage,
  deleteContactMessage,
  getAllStoreData,
  markMessageRead,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const data = await getAllStoreData();
  return NextResponse.json({ messages: data.contact_messages });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      sender_name: string;
      sender_phone?: string;
      subject: string;
      message: string;
    };
    if (!body.sender_name?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Ad soyad ve mesaj alanları zorunludur." },
        { status: 400 }
      );
    }
    const created = await createContactMessage({
      sender_name: body.sender_name.trim(),
      sender_phone: body.sender_phone?.trim() || null,
      subject: body.subject?.trim() || "Genel Talep / Öneri",
      message: body.message.trim(),
    });
    revalidatePath("/admin");
    return NextResponse.json({ message: created });
  } catch {
    return NextResponse.json({ error: "Mesaj gönderilemedi." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
  }
  await markMessageRead(id);
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
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
  await deleteContactMessage(id);
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
