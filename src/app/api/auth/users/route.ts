import { NextResponse } from "next/server";
import { isPrimaryAdminAlias, requireAdminAuth } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import {
  appendAuditLog,
  mutateSecurityState,
  readSecurityState,
} from "@/lib/security-store";
import { AdminRole, AdminUser } from "@/lib/types";

export const dynamic = "force-dynamic";

function matchesSessionUser(user: AdminUser, sessionSub: string): boolean {
  return (
    user.username === sessionSub ||
    (user.id === "user-admin-1" && isPrimaryAdminAlias(sessionSub))
  );
}

function sanitizeUser(u: AdminUser) {
  return {
    id: u.id,
    username: u.username,
    display_name: u.display_name,
    role: u.role,
    is_active: u.is_active,
    created_at: u.created_at,
    updated_at: u.updated_at,
    last_login_at: u.last_login_at,
  };
}

export async function GET() {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  const secState = await readSecurityState();
  const visibleUsers =
    auth.session.role === "yonetici"
      ? secState.users.map(sanitizeUser)
      : secState.users
          .filter((u) => matchesSessionUser(u, auth.session.sub))
          .map(sanitizeUser);

  return NextResponse.json({
    current_user: {
      username: auth.session.sub,
      display_name: auth.session.displayName,
      role: auth.session.role,
    },
    users: visibleUsers,
  });
}

export async function POST(req: Request) {
  const auth = await requireAdminAuth(["yonetici"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await req.json()) as {
      username?: string;
      display_name?: string;
      role?: AdminRole;
      password?: string;
    };

    const username = (body.username || "").trim().toLowerCase();
    const displayName = (body.display_name || "").trim();
    const role: AdminRole = body.role === "yonetici" ? "yonetici" : "editor";
    const password = body.password || "";

    if (!/^[a-z0-9çğıöşü._-]{3,32}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Kullanıcı adı 3-32 karakter olmalı ve yalnızca küçük harf, rakam, nokta, alt çizgi veya tire içermelidir.",
        },
        { status: 400 }
      );
    }
    if (displayName.length < 2 || displayName.length > 60) {
      return NextResponse.json(
        { error: "Ad Soyad 2-60 karakter arasında olmalıdır." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const secState = await readSecurityState();
    if (secState.users.some((u) => u.username.toLowerCase() === username)) {
      return NextResponse.json(
        { error: "Bu kullanıcı adı zaten mevcut." },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const newUser: AdminUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username,
      display_name: displayName,
      role,
      password_hash: hashPassword(password),
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    await mutateSecurityState((s) => ({
      ...s,
      users: [...s.users, newUser],
    }));

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "user.create",
      target: newUser.username,
      detail: `Rol: ${newUser.role}`,
    });

    return NextResponse.json({ user: sanitizeUser(newUser) }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Kullanıcı eklenemedi." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await req.json()) as {
      id?: string;
      current_password?: string;
      new_password?: string;
      role?: AdminRole;
      is_active?: boolean;
      display_name?: string;
    };

    const secState = await readSecurityState();
    const targetUser = body.id
      ? secState.users.find((u) => u.id === body.id)
      : secState.users.find((u) => matchesSessionUser(u, auth.session.sub));

    if (!targetUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    const isSelf = matchesSessionUser(targetUser, auth.session.sub);
    const isYonetici = auth.session.role === "yonetici";

    if (!isSelf && !isYonetici) {
      return NextResponse.json(
        { error: "Başka bir kullanıcının hesabını düzenleme yetkiniz yok." },
        { status: 403 }
      );
    }

    // Son aktif yöneticiyi pasifleştirme/düşürme engeli
    const activeYoneticis = secState.users.filter(
      (u) => u.is_active && u.role === "yonetici"
    );
    if (
      targetUser.role === "yonetici" &&
      activeYoneticis.length <= 1 &&
      ((body.is_active === false) || (body.role && body.role !== "yonetici"))
    ) {
      return NextResponse.json(
        { error: "Sistemdeki son aktif yönetici hesabı devre dışı bırakılamaz." },
        { status: 400 }
      );
    }

    let nextHash = targetUser.password_hash;
    let nextRevokedBefore = targetUser.revoked_before;

    if (body.new_password) {
      if (body.new_password.length < 8) {
        return NextResponse.json(
          { error: "Yeni şifre en az 8 karakter olmalıdır." },
          { status: 400 }
        );
      }
      if (isSelf) {
        if (
          !body.current_password ||
          !verifyPassword(body.current_password, targetUser.password_hash)
        ) {
          return NextResponse.json(
            { error: "Mevcut şifreniz doğrulanamadı." },
            { status: 400 }
          );
        }
      }
      nextHash = hashPassword(body.new_password);
      nextRevokedBefore = Date.now() - 1000;
    }

    const updatedUser: AdminUser = {
      ...targetUser,
      display_name:
        body.display_name?.trim() || targetUser.display_name,
      role:
        isYonetici && body.role
          ? body.role === "yonetici"
            ? "yonetici"
            : "editor"
          : targetUser.role,
      is_active:
        isYonetici && typeof body.is_active === "boolean"
          ? body.is_active
          : targetUser.is_active,
      password_hash: nextHash,
      revoked_before: nextRevokedBefore,
      updated_at: new Date().toISOString(),
    };

    await mutateSecurityState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    }));

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: body.new_password ? "user.password_change" : "user.update",
      target: updatedUser.username,
      detail: `Rol: ${updatedUser.role}, Aktif: ${updatedUser.is_active}`,
    });

    return NextResponse.json({ user: sanitizeUser(updatedUser) });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Kullanıcı güncellenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminAuth(["yonetici"]);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Kullanıcı ID eksik." }, { status: 400 });
  }

  const secState = await readSecurityState();
  const target = secState.users.find((u) => u.id === id);
  if (!target) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }
  if (matchesSessionUser(target, auth.session.sub)) {
    return NextResponse.json(
      { error: "Kendi aktif yönetici hesabınızı silemezsiniz." },
      { status: 400 }
    );
  }

  const activeYoneticis = secState.users.filter(
    (u) => u.is_active && u.role === "yonetici"
  );
  if (target.role === "yonetici" && activeYoneticis.length <= 1) {
    return NextResponse.json(
      { error: "Son aktif yönetici silinemez." },
      { status: 400 }
    );
  }

  await mutateSecurityState((s) => ({
    ...s,
    users: s.users.filter((u) => u.id !== id),
  }));

  await appendAuditLog({
    username: auth.session.sub,
    role: auth.session.role,
    action: "user.delete",
    target: target.username,
  });

  return NextResponse.json({ ok: true });
}
