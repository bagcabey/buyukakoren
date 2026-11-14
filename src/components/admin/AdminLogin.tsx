"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || "yönetmenbgc",
          password,
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error || "Giriş başarısız.");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <div className="w-full rounded-xl border border-[#e6e5e0] bg-white p-6 sm:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e6e5e0] bg-[#fbfbfa]">
          <Lock className="h-5 w-5 text-[#191919]" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-[#191919]">
          Yönetici Paneli Girişi
        </h1>
        <p className="mt-1 text-sm text-[#666560]">
          Duyuru, haber, taziye, sayfa tasarımı ve site ayarlarını yönetmek için
          giriş yapınız.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-medium text-[#191919]"
            >
              Kullanıcı Adı
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yönetmenbgc"
              className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-[#191919]"
            >
              Şifre *
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
            />
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] w-full rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
          >
            {loading ? "Kontrol ediliyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
