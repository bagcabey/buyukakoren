"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: name,
          sender_phone: phone,
          subject: subject || "Genel Talep / Öneri",
          message,
        }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error || "Gönderilemedi");
      }
      setStatus("done");
      setName("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[#191919]">
            Adınız Soyadınız *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Ahmet Yılmaz"
            className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#191919]">
            Telefon (İsteğe Bağlı)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#191919]">Konu</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Örn. Üyelik, Öneri, Duyuru Talebi"
          className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#191919]">
          Mesajınız *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Dernek yönetimine iletmek istediğiniz talep veya görüşünüzü yazınız..."
          className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
        />
      </div>

      {status === "error" && (
        <p className="text-xs text-red-600">{errorMsg}</p>
      )}
      {status === "done" && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Mesajınız dernek yönetimine başarıyla iletildi.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {status === "loading" ? "Gönderiliyor..." : "Mesaj Gönder"}
      </button>
    </form>
  );
}
