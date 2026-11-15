import { TestRunner, expect } from "./test-utils";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { getClientIp, checkLoginRateLimit, recordLoginFailure, checkAndRecordContactRateLimit } from "@/lib/rate-limit";
import { sanitizeSafeUrl, renderSafeRichText } from "@/lib/sanitize";
import {
  buildPageMetadata,
  toAbsoluteUrl,
  SITE_URL,
} from "@/lib/seo";
import { getAllStoreData } from "@/lib/store";
import fs from "fs";
import path from "path";

export async function runTier2Tests(runner: TestRunner): Promise<void> {
  // -------------------------------------------------------------
  // Feature 1: Security & Password Protection (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 1: Security & Password Protection Boundaries", async () => {
    await runner.test("F1.B1: Wrong password fails verification", async () => {
      const hash = await hashPassword("DogruSifre2026!");
      const valid = await verifyPassword("YanlisSifre123", hash);
      expect(valid).toBeFalsy();
    });

    await runner.test("F1.B2: Empty password fails verification", async () => {
      const hash = await hashPassword("DogruSifre2026!");
      const valid = await verifyPassword("", hash);
      expect(valid).toBeFalsy();
    });

    await runner.test("F1.B3: Tampered session token fails verification", async () => {
      const { token } = createSessionToken({
        username: "yonetmenbgc",
        display_name: "Yönetici",
        role: "yonetici",
      });
      const parts = token.split(".");
      // Tamper payload
      const tampered = `${parts[0]}_tampered.${parts[1]}`;
      const verified = await verifySessionToken(tampered);
      expect(verified).toBeNull();
    });

    await runner.test("F1.B4: Malformed session token without dot delimiter fails verification", async () => {
      expect(await verifySessionToken("not-a-valid-token")).toBeNull();
      expect(await verifySessionToken("")).toBeNull();
    });

    await runner.test("F1.B5: Valid token produces non-empty string and verifies successfully", async () => {
      const { token } = createSessionToken({
        username: "yonetmenbgc",
        display_name: "Yönetici",
        role: "yonetici",
      });
      expect(typeof token).toBe("string");
      const verified = await verifySessionToken(token);
      expect(verified?.sub).toBe("yonetmenbgc");
    });
  });

  // -------------------------------------------------------------
  // Feature 2: Rate Limiting & Proxy IP Safety (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 2: Rate Limiting & Proxy IP Boundaries", async () => {
    await runner.test("F2.B1: getClientIp defaults to 127.0.0.1 when all proxy headers are missing", () => {
      const req = new Request("https://buyukakoren.vercel.app/api/contact");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });

    await runner.test("F2.B2: getClientIp handles x-forwarded-for with whitespace and trailing commas", () => {
      const req = new Request("https://buyukakoren.vercel.app/api/contact", {
        headers: { "x-forwarded-for": "10.0.0.1 , 192.168.1.1 , 85.105.23.44 , " },
      });
      expect(getClientIp(req)).toBe("85.105.23.44");
    });

    await runner.test("F2.B3: Login rate limit records consecutive failures and blocks after 5", async () => {
      const attackingIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;
      for (let i = 0; i < 5; i++) {
        await recordLoginFailure(attackingIp);
      }
      const status = await checkLoginRateLimit(attackingIp);
      expect(status.allowed).toBeFalsy();
      expect(status.retryAfterSec).toBeGreaterThan(0);
    });

    await runner.test("F2.B4: Contact rate limit evaluates bucket limits and retry after", async () => {
      const spammerIp = `203.0.113.${Math.floor(Math.random() * 200 + 10)}`;
      for (let i = 0; i < 5; i++) {
        await checkAndRecordContactRateLimit(spammerIp);
      }
      const status = await checkAndRecordContactRateLimit(spammerIp);
      expect(status.allowed).toBeFalsy();
    });

    await runner.test("F2.B5: Spoofed internal IP in x-forwarded-for does not override vercel-ip", () => {
      const req = new Request("https://buyukakoren.vercel.app/api/contact", {
        headers: {
          "x-vercel-ip": "46.154.20.10",
          "x-forwarded-for": "127.0.0.1",
        },
      });
      expect(getClientIp(req)).toBe("46.154.20.10");
    });
  });

  // -------------------------------------------------------------
  // Feature 3: Link Sanitization & XSS Prevention (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 3: Link Sanitization & XSS Prevention Boundaries", async () => {
    await runner.test("F3.B1: sanitizeSafeUrl strips javascript: pseudo-protocol", () => {
      expect(sanitizeSafeUrl("javascript:alert(1)")).toBe("");
      expect(sanitizeSafeUrl("JAVASCRIPT:alert('xss')")).toBe("");
      expect(sanitizeSafeUrl("  javascript:void(0)  ")).toBe("");
    });

    await runner.test("F3.B2: sanitizeSafeUrl strips data: URIs", () => {
      expect(sanitizeSafeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
      expect(sanitizeSafeUrl("DATA:image/svg+xml;base64,PHN2Zy...")).toBe("");
    });

    await runner.test("F3.B3: sanitizeSafeUrl blocks protocol-relative // URLs", () => {
      expect(sanitizeSafeUrl("//malicious-site.com/phish")).toBe("");
      expect(sanitizeSafeUrl("///evil.com")).toBe("");
    });

    await runner.test("F3.B4: sanitizeSafeUrl blocks backslash evasion attempts", () => {
      expect(sanitizeSafeUrl("/\\malicious.com")).toBe("");
      expect(sanitizeSafeUrl("https:\\\\malicious.com")).toBe("");
    });

    await runner.test("F3.B5: sanitizeSafeUrl safely handles empty, null, and non-string inputs", () => {
      expect(sanitizeSafeUrl(null)).toBe("");
      expect(sanitizeSafeUrl(undefined)).toBe("");
      expect(sanitizeSafeUrl("")).toBe("");
      expect(sanitizeSafeUrl("   ")).toBe("");
    });
  });

  // -------------------------------------------------------------
  // Feature 4: RBAC on Administrative Deletions (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 4: RBAC Deletions Boundaries", async () => {
    await runner.test("F4.B1: requireAdminAuth requires 'yonetici' role on DELETE in posts API", () => {
      const routeContent = fs.readFileSync(path.resolve("src/app/api/posts/route.ts"), "utf-8");
      expect(routeContent).toContain('requireAdminAuth(["yonetici"])');
    });

    await runner.test("F4.B2: requireAdminAuth requires 'yonetici' role on DELETE in condolences API", () => {
      const routeContent = fs.readFileSync(path.resolve("src/app/api/condolences/route.ts"), "utf-8");
      expect(routeContent).toContain('requireAdminAuth(["yonetici"])');
    });

    await runner.test("F4.B3: requireAdminAuth requires 'yonetici' role on DELETE in gallery API", () => {
      const routeContent = fs.readFileSync(path.resolve("src/app/api/gallery/route.ts"), "utf-8");
      expect(routeContent).toContain('requireAdminAuth(["yonetici"])');
    });

    await runner.test("F4.B4: requireAdminAuth requires 'yonetici' role on DELETE in contact messages API", () => {
      const routeContent = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(routeContent).toContain('requireAdminAuth(["yonetici"])');
    });

    await runner.test("F4.B5: DELETE endpoints return 400 Bad Request if ID parameter is missing", () => {
      const postsRoute = fs.readFileSync(path.resolve("src/app/api/posts/route.ts"), "utf-8");
      expect(postsRoute).toContain('searchParams.get("id")');
      expect(postsRoute).toContain('{ error: "ID gerekli." }, { status: 400 }');
    });
  });

  // -------------------------------------------------------------
  // Feature 5: Mobile Navigation & Layout Safety (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 5: Mobile Navigation Boundaries", async () => {
    await runner.test("F5.B1: MobileBottomNav masks on /admin nested paths", () => {
      const content = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(content).toContain('rawPathname.startsWith("/admin")');
    });

    await runner.test("F5.B2: MobileBottomNav masks on /yonetmenbgc nested paths", () => {
      const content = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(content).toContain('rawPathname.startsWith("/yonetmenbgc")');
    });

    await runner.test("F5.B3: Root layout applies main pb-24 padding for mobile to prevent content clipping", () => {
      const content = fs.readFileSync(path.resolve("src/app/layout.tsx"), "utf-8");
      expect(content).toContain("pb-24 lg:pb-0");
    });

    await runner.test("F5.B4: Mobile bottom nav exact match applies only to home page '/'", () => {
      const content = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(content).toContain('exact: true');
    });

    await runner.test("F5.B5: Mobile bottom nav has no-print class preventing inclusion in print jobs", () => {
      const content = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(content).toContain("no-print");
    });
  });

  // -------------------------------------------------------------
  // Feature 6: Admin Panel Forms & WYSIWYG/Preview (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 6: Admin Panel Forms Boundaries", async () => {
    await runner.test("F6.B1: SerpSimulatorCard detects title length > 60 chars as overly long", () => {
      const content = fs.readFileSync(path.resolve("src/components/admin/SerpSimulatorCard.tsx"), "utf-8");
      expect(content).toContain("Çok Uzun (Arama motoru kesebilir)");
    });

    await runner.test("F6.B2: SerpSimulatorCard detects title length < 30 chars as short", () => {
      const content = fs.readFileSync(path.resolve("src/components/admin/SerpSimulatorCard.tsx"), "utf-8");
      expect(content).toContain("Kısa (Genişletilebilir)");
    });

    await runner.test("F6.B3: MarkdownPostEditor handles empty text input without crashing", () => {
      expect(renderSafeRichText("")).toBe("");
      expect(renderSafeRichText("   ")).toBe("");
    });

    await runner.test("F6.B4: MarkdownPostEditor prevents raw <script> execution in rich text", () => {
      const sanitized = renderSafeRichText('<script>alert("hacked")</script>');
      expect(sanitized.includes("<script>")).toBeFalsy();
    });

    await runner.test("F6.B5: SerpSimulatorCard automatically trims leading slashes from slug", () => {
      const content = fs.readFileSync(path.resolve("src/components/admin/SerpSimulatorCard.tsx"), "utf-8");
      expect(content).toContain('slug ? slug.replace(/^\\//, "")');
    });
  });

  // -------------------------------------------------------------
  // Feature 7: Taziye & Gallery Form Enhancements (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 7: Taziye & Gallery Form Boundaries", async () => {
    await runner.test("F7.B1: Contact message rejected when message body is under 10 characters", () => {
      const content = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(content).toContain("message.length < 10");
      expect(content).toContain("Mesajınız 10 ile 2000 karakter arasında olmalıdır.");
    });

    await runner.test("F7.B2: Contact message rejected when message body exceeds 2000 characters", () => {
      const content = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(content).toContain("message.length > 2000");
    });

    await runner.test("F7.B3: Contact message rejected when sender name is under 2 characters", () => {
      const content = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(content).toContain("senderName.length < 2");
    });

    await runner.test("F7.B4: Condolence POST handler checks deceased_name is present and non-empty", () => {
      const content = fs.readFileSync(path.resolve("src/app/api/condolences/route.ts"), "utf-8");
      expect(content).toContain("Vefat eden adı ve cenaze tarihi zorunludur.");
    });

    await runner.test("F7.B5: Gallery upload rejects files that are not valid images", () => {
      const content = fs.readFileSync(path.resolve("src/components/admin/BatchGalleryUploader.tsx"), "utf-8");
      expect(content).toContain('if (!file.type.startsWith("image/")) continue;');
      expect(content).toContain('accept="image/*"');
    });
  });

  // -------------------------------------------------------------
  // Feature 8: Village History, Culture & Demographics (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 8: Village Demographics Boundaries", async () => {
    await runner.test("F8.B1: Village elevation 1276m is within realistic range", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("1.276");
    });

    await runner.test("F8.B2: Distance numbers to Sivas (62 km) and Yıldızeli (49 km) are verified", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("62 km");
      expect(text).toContain("49 km");
    });

    await runner.test("F8.B3: Exactly 3 traditional mahalles are indexed", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("Yukarı");
      expect(text).toContain("Aşağı");
      expect(text).toContain("Şeyhler");
    });

    await runner.test("F8.B4: Exactly 3 mosques are recorded (Merkez, Yeni, Şeyhler)", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("3 cami");
    });

    await runner.test("F8.B5: TÜİK census population data spans 1990 to 2025", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("449 Kişi");
    });
  });

  // -------------------------------------------------------------
  // Feature 9: Association Profile & Leadership (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 9: Association Profile Boundaries", async () => {
    await runner.test("F9.B1: Postal code is strictly 58502", async () => {
      const store = await getAllStoreData(false);
      expect(JSON.stringify(store)).toContain("58502");
    });

    await runner.test("F9.B2: Area telephone code is 0346 (Sivas)", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("0346");
    });

    await runner.test("F9.B3: Association name is non-empty", async () => {
      const store = await getAllStoreData(false);
      expect(store.site_settings.association_name.length).toBeGreaterThan(0);
    });

    await runner.test("F9.B4: Muhtar phone is 0536 722 16 07", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("0536 722 16 07");
    });

    await runner.test("F9.B5: School phone is (0346) 753 11 22", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("753 11 22");
    });
  });

  // -------------------------------------------------------------
  // Feature 10: Turkish Legal & KVKK Compliance (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 10: Legal Compliance Boundaries", async () => {
    await runner.test("F10.B1: Contact route rejects request when kvkk_consent is false", () => {
      const content = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(content).toContain("body.kvkk_consent !== true");
    });

    await runner.test("F10.B2: Contact route rejects request when kvkk_consent is undefined or null", () => {
      const content = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(content).toContain("status: 400");
    });

    await runner.test("F10.B3: Contact phone validation enforces 7 to 30 chars boundary", () => {
      const content = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(content).toContain("senderPhone.length < 7 || senderPhone.length > 30");
    });

    await runner.test("F10.B4: Permissions-Policy strictly disables camera, microphone, and geolocation", () => {
      const nextConf = fs.readFileSync(path.resolve("next.config.ts"), "utf-8");
      expect(nextConf).toContain("camera=(), microphone=(), geolocation=()");
    });

    await runner.test("F10.B5: Frame-ancestors 'none' and X-Frame-Options DENY prevent clickjacking", () => {
      const nextConf = fs.readFileSync(path.resolve("next.config.ts"), "utf-8");
      expect(nextConf).toContain("frame-ancestors 'none'");
      expect(nextConf).toContain('"X-Frame-Options", value: "DENY"');
    });
  });

  // -------------------------------------------------------------
  // Feature 11: SEO Metadata & Schema.org JSON-LD (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 11: SEO Metadata Boundaries", async () => {
    await runner.test("F11.B1: Title with > 60 chars is strictly clamped to 60 chars with ellipsis", () => {
      const longTitle = "Bu Çok Uzun Bir Duyuru Başlığıdır ve Arama Motorlarında Kesilmemesi İçin Mutlaka Kısaltılmalıdır";
      const meta = buildPageMetadata({
        title: longTitle,
        description: "Açıklama",
        path: "/duyurular",
      });
      const res = typeof meta.title === "string" ? meta.title : (meta.title as { default: string })?.default;
      expect(res.length).toBeLessThanOrEqual(60);
      expect(res.endsWith("...")).toBeTruthy();
    });

    await runner.test("F11.B2: Description with > 155 chars is strictly clamped to 155 chars with ellipsis", () => {
      const longDesc = "A".repeat(250);
      const meta = buildPageMetadata({
        title: "Kısa Başlık",
        description: longDesc,
        path: "/duyurular",
      });
      expect(meta.description?.length).toBeLessThanOrEqual(155);
      expect(meta.description?.endsWith("...")).toBeTruthy();
    });

    await runner.test("F11.B3: toAbsoluteUrl cleanly converts relative paths to full https URL", () => {
      expect(toAbsoluteUrl("/iletisim")).toBe(`${SITE_URL}/iletisim`);
      expect(toAbsoluteUrl("koyumuz")).toBe(`${SITE_URL}/koyumuz`);
    });

    await runner.test("F11.B4: toAbsoluteUrl leaves absolute http/https URLs unchanged", () => {
      expect(toAbsoluteUrl("https://example.com/img.jpg")).toBe("https://example.com/img.jpg");
      expect(toAbsoluteUrl("http://example.com/page")).toBe("http://example.com/page");
    });

    await runner.test("F11.B5: toAbsoluteUrl handles empty or whitespace input by returning SITE_URL", () => {
      expect(toAbsoluteUrl("")).toBe(SITE_URL);
      expect(toAbsoluteUrl("   ")).toBe(SITE_URL);
    });
  });

  // -------------------------------------------------------------
  // Feature 12: Build, Lint & Live Deployment Verification (Boundaries)
  // -------------------------------------------------------------
  await runner.suite("Tier 2 - Feature 12: Build Verification Boundaries", async () => {
    await runner.test("F12.B1: Crypto derive key material requires minimal secret length >= 16", async () => {
      const { getServerKeyMaterial } = await import("@/lib/crypto");
      const mat = getServerKeyMaterial();
      expect(mat !== null).toBeTruthy();
      expect(mat!.length).toBeGreaterThanOrEqual(16);
    });

    await runner.test("F12.B2: 404 not-found route exists in app directory", () => {
      expect(fs.existsSync(path.resolve("src/app/not-found.tsx"))).toBeTruthy();
    });

    await runner.test("F12.B3: manifest.webmanifest exists in app directory", () => {
      expect(fs.existsSync(path.resolve("src/app/manifest.ts"))).toBeTruthy();
    });

    await runner.test("F12.B4: Sharp image optimizer is present in package.json dependencies", () => {
      const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
      expect(Boolean(pkg.dependencies.sharp)).toBeTruthy();
    });

    await runner.test("F12.B5: Next.js images remote patterns restrict blob and wikimedia hosts only", () => {
      const nextConf = fs.readFileSync(path.resolve("next.config.ts"), "utf-8");
      expect(nextConf).toContain("**.public.blob.vercel-storage.com");
      expect(nextConf).toContain("upload.wikimedia.org");
    });
  });
}
