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

  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("editor");
  const [newUserPassword, setNewUserPassword] = useState("");

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
    notify("Şifreniz güncellendi.");
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="mt-6 space-y-6">
      {/* Own Password */}
      <form
        onSubmit={handleChangeOwnPassword}
        className="max-w-xl rounded-xl border border-[#e6e5e0] bg-[#fbfbfa] p-5"
      >
        <h2 className="flex items-center gap-1.5 text-base font-semibold text-[#191919]">
          <KeyRound className="h-4 w-4" />
          Hesap Şifresini Güncelle ({currentUser.display_name} • {currentUser.role})
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="password"
            required
            placeholder="Mevcut şifre"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
          />
          <input
            type="password"
            required
            minLength={10}
            placeholder="Yeni şifre (en az 10 karakter)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
          />
        </div>
        <button
          type="submit"
          className="mt-3 rounded-lg bg-[#191919] px-4 py-2 text-xs font-medium text-white hover:bg-[#333333]"
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
            <input
              type="text"
              required
              placeholder="Kullanıcı adı (örn. editor1)"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Ad Soyad / Görünen Ad"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AdminRole)}
              className="w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            >
              <option value="editor">Editör (İçerik & Galeri)</option>
              <option value="yonetici">Tam Yönetici</option>
            </select>
            <input
              type="password"
              required
              minLength={10}
              placeholder="Başlangıç şifresi (en az 10 karakter)"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-xs"
            />
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
          <div className="mt-4 overflow-x-auto">
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
