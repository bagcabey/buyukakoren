"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot bot tuzağı
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [formRenderedAt, setFormRenderedAt] = useState<number>(0);

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setFormRenderedAt(Date.now());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kvkkConsent) {
      setStatus("error");
      setErrorMsg(
        "Devam edebilmek için KVKK Aydınlatma Metni onay kutusunu işaretlemeniz gerekir."
      );
      return;
    }

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
          kvkk_consent: kvkkConsent,
          website,
          formRenderedAt,
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
      setKvkkConsent(false);
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Görünmez honeypot alanı */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="contact-website-hp">Web Sitesi</label>
        <input
          id="contact-website-hp"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-sender-name"
            className="block text-xs font-medium text-[#191919]"
          >
            Adınız Soyadınız *
          </label>
          <input
            id="contact-sender-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Ahmet Yılmaz"
            className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
          />
        </div>
        <div>
          <label
            htmlFor="contact-sender-phone"
            className="block text-xs font-medium text-[#191919]"
          >
            Telefon (İsteğe Bağlı)
          </label>
          <input
            id="contact-sender-phone"
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
            className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-xs font-medium text-[#191919]"
        >
          Konu
        </label>
        <input
          id="contact-subject"
          type="text"
          maxLength={120}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Örn. Üyelik, Öneri, Duyuru Talebi"
          className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-xs font-medium text-[#191919]"
        >
          Mesajınız *
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Dernek yönetimine iletmek istediğiniz talep veya görüşünüzü yazınız..."
          className="mt-1.5 w-full rounded-lg border border-[#e6e5e0] bg-white px-3 py-2 text-sm text-[#191919] outline-none focus:border-[#191919]"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#e6e5e0] bg-[#fbfbfa] p-3 text-xs leading-relaxed text-[#44433f]">
        <input
          type="checkbox"
          required
          checked={kvkkConsent}
          onChange={(e) => setKvkkConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#cfcec8] text-red-800 focus:ring-red-800"
        />
        <span>
          <Link
            href="/kvkk"
            className="font-semibold text-red-800 underline hover:text-red-950"
          >
            KVKK Aydınlatma Metni
          </Link>
          &apos;ni okudum; paylaştığım ad, soyad, telefon ve mesaj bilgilerimin
          iletişim talebimin yanıtlanması amacıyla dernek yönetimince
          işlenmesini kabul ediyorum.
        </span>
      </label>

      {status === "error" && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {errorMsg}
        </p>
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
        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#191919] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {status === "loading" ? "Gönderiliyor..." : "Mesaj Gönder"}
      </button>
    </form>
  );
}
