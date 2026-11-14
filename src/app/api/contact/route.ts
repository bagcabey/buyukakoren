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

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Yetkisiz erişim." },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }
  const data = await getAllStoreData();
  return NextResponse.json(
    { messages: data.contact_messages },
    { headers: NO_STORE_HEADERS }
  );
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
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
    const created = await createContactMessage({
      sender_name: body.sender_name.trim(),
      sender_phone: body.sender_phone?.trim() || null,
      subject: body.subject?.trim() || "Genel Talep / Öneri",
      message: body.message.trim(),
    });
    revalidatePath("/admin");
    return NextResponse.json(
      { message: created },
      { headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: "Mesaj gönderilemedi." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Yetkisiz erişim." },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "ID gerekli." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
  await markMessageRead(id);
  revalidatePath("/admin");
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Yetkisiz erişim." },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "ID gerekli." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
  await deleteContactMessage(id);
  revalidatePath("/admin");
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}
