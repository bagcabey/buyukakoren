"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, ShieldAlert, Trash2, UserPlus } from "lucide-react";
import { AdminRole, AuditLogEntry } from "@/lib/types";

interface PublicAdminUser {
  id: string;
  username: string;
  display_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

function getPasswordStrength(pwd: string): {
  score: number; // 0 to 3
  label: "Zayıf" | "Orta" | "Güçlü";
  colorClass: string;
  barColor: string;
} {
  if (!pwd) {
    return { score: 0, label: "Zayıf", colorClass: "text-stone-400", barColor: "bg-stone-200" };
  }
  let points = 0;
  if (pwd.length >= 10) points += 1;
  if (pwd.length >= 14) points += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) points += 1;
  if (/\d/.test(pwd)) points += 1;
  if (/[^a-zA-Z0-9]/.test(pwd)) points += 1;

  if (points <= 2 || pwd.length < 10) {
    return { score: 1, label: "Zayıf", colorClass: "text-red-600", barColor: "bg-red-500" };
  } else if (points <= 4) {
    return { score: 2, label: "Orta", colorClass: "text-amber-600", barColor: "bg-amber-500" };
  } else {
    return { score: 3, label: "Güçlü", colorClass: "text-emerald-600", barColor: "bg-emerald-500" };
  }
}

export function UsersAuditTab({
  currentUser,
  notify,
}: {
  currentUser: { username: string; display_name: string; role: AdminRole };
  notify: (msg: string, err?: boolean) => void;
}) {
  const isManager = currentUser.role === "yonetici";
  const [users, setUsers] = useState<PublicAdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("editor");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");

  const loadData = useCallback(async () => {
    const uRes = await fetch("/api/auth/users", { cache: "no-store" });
    if (uRes.ok) {
      const uj = (await uRes.json()) as { users?: PublicAdminUser[] };
      setUsers(uj.users || []);
    }
    if (isManager) {
      const aRes = await fetch("/api/audit", { cache: "no-store" });
      if (aRes.ok) {
        const aj = (await aRes.json()) as { logs?: AuditLogEntry[] };
        setLogs(aj.logs || []);
      }
    }
  }, [isManager]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleChangeOwnPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 10) {
      notify("Yeni şifre en az 10 karakter olmalıdır.", true);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      notify("Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.", true);
      return;
    }
    const res = await fetch("/api/auth/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify(j.error || "Şifre güncellenemedi.", true);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    notify("Şifreniz güncellendi.");
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (newUserPassword.length < 10) {
      notify("Şifre en az 10 karakter olmalıdır.", true);
      return;
    }
    if (newUserPassword !== newUserPasswordConfirm) {
      notify("Şifreler eşleşmiyor! Lütfen şifre tekrarını kontrol edin.", true);
      return;
    }
    const res = await fetch("/api/auth/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUsername,
        display_name: newDisplayName,
        role: newRole,
        password: newUserPassword,
      }),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify(j.error || "Kullanıcı eklenemedi.", true);
      return;
    }
    setNewUsername("");
    setNewDisplayName("");
    setNewUserPassword("");
    setNewUserPasswordConfirm("");
    await loadData();
    notify("Yeni yönetici/editör hesabı oluşturuldu.");
  }

  async function handleToggleUser(u: PublicAdminUser, field: "is_active" | "role") {
    const payload =
      field === "is_active"
        ? { id: u.id, is_active: !u.is_active }
        : { id: u.id, role: u.role === "yonetici" ? "editor" : "yonetici" };

    const res = await fetch("/api/auth/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify(j.error || "İşlem başarısız.", true);
      return;
    }
    await loadData();
    notify("Kullanıcı yetkisi güncellendi.");
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/auth/users?id=${id}`, { method: "DELETE" });
    const j = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify(j.error || "Kullanıcı silinemedi.", true);
      return;
    }
    await loadData();
    notify("Kullanıcı silindi.");
  }

  const ownPwStrength = getPasswordStrength(newPassword);
  const userPwStrength = getPasswordStrength(newUserPassword);

  return (
    <div className="mt-6 space-y-6">
      {/* Own Password */}
      <form
        onSubmit={handleChangeOwnPassword}
        className="max-w-2xl rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5"
      >
        <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#191919]">
          <KeyRound className="h-4 w-4" />
          Hesap Şifresini Güncelle ({currentUser.display_name} • {currentUser.role})
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-[11px] font-medium text-[#666560]">
              Mevcut Şifre *
            </label>
            <input
              type="password"
              required
              placeholder="Mevcut şifre"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#666560]">
              Yeni Şifre (en az 10) *
            </label>
            <input
              type="password"
              required
              minLength={10}
              placeholder="Yeni şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            />
            {newPassword.length > 0 && (
              <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                <span className="text-[#666560]">Güç:</span>
                <span className={`font-semibold ${ownPwStrength.colorClass}`}>
                  {ownPwStrength.label}
                </span>
                <div className="flex flex-1 gap-1">
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      ownPwStrength.score >= 1 ? ownPwStrength.barColor : "bg-[#e6e5e0]"
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      ownPwStrength.score >= 2 ? ownPwStrength.barColor : "bg-[#e6e5e0]"
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      ownPwStrength.score >= 3 ? ownPwStrength.barColor : "bg-[#e6e5e0]"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#666560]">
              Yeni Şifre Tekrarı *
            </label>
            <input
              type="password"
              required
              minLength={10}
              placeholder="Şifre tekrarı"
              value={newPasswordConfirm}
              onChange={(e) => setNewPasswordConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            />
            {newPasswordConfirm.length > 0 && (
              <p
                className={`mt-1 text-[10px] font-medium ${
                  newPassword === newPasswordConfirm
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {newPassword === newPasswordConfirm
                  ? "✓ Şifreler eşleşiyor"
                  : "✗ Şifreler eşleşmiyor"}
              </p>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-[#191919] px-4 py-2 text-xs font-medium text-white hover:bg-[#333333]"
        >
          Şifreyi Güncelle
        </button>
      </form>

      {isManager && (
        <div className="grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleCreateUser}
            className="space-y-3 rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5 lg:col-span-5"
          >
            <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#191919]">
              <UserPlus className="h-4 w-4" />
              Yeni Kullanıcı Ekle
            </h2>
            <p className="text-xs text-[#666560]">
              <strong>Yönetici:</strong> tüm ayarlara ve kullanıcı yönetimine erişir.{" "}
              <strong>Editör:</strong> içerik, sayfa ve galeri düzenler; IBAN ve sistem ayarlarını değiştiremez.
            </p>
            <div>
              <label className="block text-[11px] font-medium text-[#666560]">
                Kullanıcı Adı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn. editor1"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#666560]">
                Ad Soyad / Görünen Ad *
              </label>
              <input
                type="text"
                required
                placeholder="Örn. Ahmet Yılmaz"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#666560]">
                Rol & Yetki *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
              >
                <option value="editor">Editör (İçerik & Galeri)</option>
                <option value="yonetici">Tam Yönetici</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#666560]">
                Başlangıç Şifresi (en az 10 karakter) *
              </label>
              <input
                type="password"
                required
                minLength={10}
                placeholder="Güçlü bir şifre giriniz..."
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
              />
              {newUserPassword.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#666560]">Şifre Gücü:</span>
                    <span className={`font-semibold ${userPwStrength.colorClass}`}>
                      {userPwStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        userPwStrength.score >= 1 ? userPwStrength.barColor : "bg-[#e6e5e0]"
                      }`}
                    />
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        userPwStrength.score >= 2 ? userPwStrength.barColor : "bg-[#e6e5e0]"
                      }`}
                    />
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        userPwStrength.score >= 3 ? userPwStrength.barColor : "bg-[#e6e5e0]"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-[#666560]">
                    En az 10 karakter, büyük-küçük harf, rakam ve sembol önerilir.
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#666560]">
                Şifre Tekrarı *
              </label>
              <input
                type="password"
                required
                minLength={10}
                placeholder="Şifreyi tekrar doğrulayın..."
                value={newUserPasswordConfirm}
                onChange={(e) => setNewUserPasswordConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
              />
              {newUserPasswordConfirm.length > 0 && (
                <p
                  className={`mt-1 text-[11px] font-medium ${
                    newUserPassword === newUserPasswordConfirm
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {newUserPassword === newUserPasswordConfirm
                    ? "✓ Şifreler eşleşiyor"
                    : "✗ Şifreler eşleşmiyor"}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#191919] py-2.5 text-xs font-medium text-white hover:bg-[#333333]"
            >
              Kullanıcı Oluştur
            </button>
          </form>

          <div className="space-y-3 rounded-xl border border-[#e6e5e0] bg-white p-5 lg:col-span-7">
            <h2 className="text-base font-semibold text-[#191919]">
              Yetkili Kullanıcılar ({users.length})
            </h2>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] px-3 py-2.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#191919]">
                      {u.display_name}{" "}
                      <span className="font-mono text-[11px] font-normal text-[#666560]">
                        (@{u.username})
                      </span>
                    </p>
                    <p className="text-[11px] text-[#666560]">
                      Rol: {u.role} • {u.is_active ? "Aktif" : "Pasif"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleUser(u, "role")}
                      className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1 text-[11px] font-medium hover:bg-[#f4f3ef]"
                    >
                      Rol Değiştir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleUser(u, "is_active")}
                      className="rounded border border-[#e6e5e0] bg-white px-2.5 py-1 text-[11px] font-medium hover:bg-[#f4f3ef]"
                    >
                      {u.is_active ? "Pasif Et" : "Aktif Et"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id)}
                      className="rounded border border-[#e6e5e0] bg-white p-1.5 text-red-600 hover:bg-red-50"
                      title="Kullanıcıyı Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isManager && (
        <div className="rounded-xl border border-[#e6e5e0] bg-white p-5">
          <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#191919]">
            <ShieldAlert className="h-4 w-4 text-red-700" />
            Son İşlem Günlüğü (Audit Log — Son {logs.length} Kayıt)
          </h2>
          {/* Mobile Stacked Cards (under md) */}
          <div className="mt-4 space-y-3 md:hidden">
            {logs.slice(0, 60).map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#e6e5e0]/60 pb-2">
                  <span className="font-mono text-[10px] text-[#666560]">
                    {new Date(log.timestamp).toLocaleString("tr-TR")}
                  </span>
                  <span className="inline-flex items-center rounded bg-[#e6e5e0] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#191919]">
                    {log.action}
                  </span>
                </div>
                <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
                  <span className="font-medium text-[#191919]">
                    {log.username}{" "}
                    <span className="text-[11px] font-normal text-[#666560]">
                      ({log.role})
                    </span>
                  </span>
                  <span className="min-w-0 truncate font-mono text-[11px] text-[#666560]">
                    {log.target}
                  </span>
                </div>
                {log.detail && (
                  <p className="mt-2 break-words rounded border border-[#e6e5e0]/60 bg-white px-2.5 py-1.5 text-[11px] text-[#4a4945]">
                    {log.detail}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table (md and above) */}
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e6e5e0] text-[#666560]">
                  <th className="py-2 pr-3 font-medium">Tarih</th>
                  <th className="py-2 pr-3 font-medium">Kullanıcı</th>
                  <th className="py-2 pr-3 font-medium">İşlem</th>
                  <th className="py-2 pr-3 font-medium">Hedef</th>
                  <th className="py-2 font-medium">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e5e0]">
                {logs.slice(0, 60).map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-2 pr-3 text-[#666560]">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 font-medium text-[#191919]">
                      {log.username} ({log.role})
                    </td>
                    <td className="whitespace-nowrap py-2 pr-3 font-mono text-[11px] text-[#191919]">
                      {log.action}
                    </td>
                    <td className="py-2 pr-3 font-mono text-[11px] text-[#666560]">
                      {log.target}
                    </td>
                    <td className="py-2 text-[#4a4945]">{log.detail || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
