import { NextResponse } from "next/server";
import { createAdminSession, getAdminPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { password?: string };
    if (!body.password || body.password !== getAdminPassword()) {
      return NextResponse.json(
        { error: "Yönetici şifresi hatalı." },
        { status: 401 }
      );
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
}
