import { NextResponse } from "next/server";
import {
  authenticateAdminCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { hashIpAddress } from "@/lib/crypto";
import {
  checkLoginRateLimit,
  getClientIp,
  recordLoginFailure,
  resetLoginRateLimit,
} from "@/lib/rate-limit";
import { appendAuditLog } from "@/lib/security-store";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipHash = hashIpAddress(ip);

  try {
    const rateCheck = await checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Çok fazla hatalı giriş denemesi. Güvenliğiniz için erişim geçici olarak sınırlandırıldı.",
          retryAfterSec: rateCheck.retryAfterSec,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSec) },
        }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    const username = typeof body.username === "string" ? body.username : "yönetmenbgc";
    const password = typeof body.password === "string" ? body.password : "";

    const result = await authenticateAdminCredentials(username, password);

    if (result.configMissing) {
      return NextResponse.json(
        {
          error:
            "Henüz yönetici hesabı yok ve ilk kurulum şifresi tanımlı değil. Sunucuda ADMIN_PASSWORD tanımlanmalıdır.",
        },
        { status: 503 }
      );
    }

    if (!result.ok || !result.user) {
      const failure = await recordLoginFailure(ip);
      await appendAuditLog({
        username: username.trim().toLowerCase() || "yönetmenbgc",
        role: "system",
        action: "auth.login_failed",
        target: "admin_session",
        detail: `Başarısız deneme #${failure.count}`,
        ip_hash: ipHash,
      });

      if (failure.blocked) {
        return NextResponse.json(
          {
            error:
              "Çok fazla hatalı giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.",
            retryAfterSec: failure.retryAfterSec,
          },
          {
            status: 429,
            headers: { "Retry-After": String(failure.retryAfterSec) },
          }
        );
      }

      return NextResponse.json(
        { error: "Kullanıcı adı veya yönetici şifresi hatalı." },
        { status: 401 }
      );
    }

    await resetLoginRateLimit(ip);

    const { token } = createSessionToken(result.user);
    await appendAuditLog({
      username: result.user.username,
      role: result.user.role,
      action: "auth.login",
      target: "admin_session",
      ip_hash: ipHash,
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        username: result.user.username,
        display_name: result.user.display_name,
        role: result.user.role,
      },
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return response;
  } catch (err) {
    console.error("[auth/login] Hata:", err);
    return NextResponse.json(
      { error: "Giriş işlemi sırasında bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
