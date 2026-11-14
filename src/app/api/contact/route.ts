import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { hashIpAddress } from "@/lib/crypto";
import { checkAndRecordContactRateLimit, getClientIp } from "@/lib/rate-limit";
import { appendAuditLog } from "@/lib/security-store";
import {
  createContactMessage,
  deleteContactMessage,
  getContactMessages,
  markMessageRead,
} from "@/lib/store";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET() {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  const messages = await getContactMessages();
  return NextResponse.json({ messages }, { headers: NO_STORE_HEADERS });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ipHash = hashIpAddress(ip);

  try {
    const body = (await req.json().catch(() => ({}))) as {
      sender_name?: unknown;
      sender_phone?: unknown;
      full_name?: unknown;
      phone?: unknown;
      subject?: unknown;
      message?: unknown;
      kvkk_consent?: unknown;
      website?: unknown;
      formRenderedAt?: unknown;
    };

    // 1. Görünmez honeypot kontrolü
    if (typeof body.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json(
        { error: "Form doğrulaması başarısız." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // 2. Çok hızlı bot gönderimi koruması
    if (typeof body.formRenderedAt === "number") {
      const elapsed = Date.now() - body.formRenderedAt;
      if (elapsed >= 0 && elapsed < 1500) {
        return NextResponse.json(
          { error: "Lütfen formu göndermeden önce birkaç saniye bekleyin." },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }

    // 3. IP hız sınırı
    const limit = await checkAndRecordContactRateLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error:
            "Kısa sürede çok fazla mesaj gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
        },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            "Retry-After": String(limit.retryAfterSec),
          },
        }
      );
    }

    // 4. Alan uzunluk ve KVKK doğrulaması
    const rawName = body.sender_name ?? body.full_name;
    const rawPhone = body.sender_phone ?? body.phone;

    const senderName = typeof rawName === "string" ? rawName.trim() : "";
    const senderPhone = typeof rawPhone === "string" ? rawPhone.trim() : "";
    const subject =
      typeof body.subject === "string" && body.subject.trim()
        ? body.subject.trim()
        : "Genel Talep / Öneri";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (senderName.length < 2 || senderName.length > 100) {
      return NextResponse.json(
        { error: "Ad soyad 2 ile 100 karakter arasında olmalıdır." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (senderPhone && (senderPhone.length < 7 || senderPhone.length > 30)) {
      return NextResponse.json(
        { error: "Telefon numarası 7 ile 30 karakter arasında olmalıdır." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (subject.length < 2 || subject.length > 120) {
      return NextResponse.json(
        { error: "Konu başlığı 2 ile 120 karakter arasında olmalıdır." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json(
        { error: "Mesajınız 10 ile 2000 karakter arasında olmalıdır." },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (body.kvkk_consent !== true) {
      return NextResponse.json(
        {
          error:
            "Mesaj gönderebilmek için KVKK Aydınlatma Metni onay kutusunu işaretlemeniz gerekir.",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const created = await createContactMessage({
      sender_name: senderName,
      sender_phone: senderPhone || null,
      subject,
      message,
      kvkk_consent: true,
      ip_hash: ipHash,
    });

    revalidatePath("/admin");
    return NextResponse.json(
      { message: created },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("[contact/post] Mesaj kaydedilemedi:", err);
    return NextResponse.json(
      { error: "Mesaj gönderilemedi." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  let id = searchParams.get("id");
  let isRead = true;

  if (!id) {
    const body = (await req.json().catch(() => ({}))) as {
      id?: string;
      is_read?: boolean;
    };
    id = body.id || null;
    if (typeof body.is_read === "boolean") isRead = body.is_read;
  }

  if (!id) {
    return NextResponse.json(
      { error: "ID gerekli." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  await markMessageRead(id, isRead);
  await appendAuditLog({
    username: auth.session.sub,
    role: auth.session.role,
    action: "message.mark_read",
    target: id,
  });

  revalidatePath("/admin");
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}

export async function DELETE(req: Request) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "ID gerekli." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  await deleteContactMessage(id);
  await appendAuditLog({
    username: auth.session.sub,
    role: auth.session.role,
    action: "message.delete",
    target: id,
  });

  revalidatePath("/admin");
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}
