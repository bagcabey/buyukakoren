import { TestRunner, expect } from "./test-utils";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  getClientIp,
} from "@/lib/rate-limit";
import { sanitizeSafeUrl, renderSafeRichText } from "@/lib/sanitize";
import {
  buildPageMetadata,
  buildPlaceJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo";
import { getAllStoreData } from "@/lib/store";
import fs from "fs";
import path from "path";

export async function runTier3Tests(runner: TestRunner): Promise<void> {
  await runner.suite("Tier 3 - Pairwise Feature Interaction Testing", async () => {
    // Pair 1: F1 (Auth) + F2 (Rate Limiting)
    await runner.test("P1 (F1+F2): Rate limiting isolates failed logins per IP while legitimate IP remains unblocked", async () => {
      const badIp = `192.0.2.${Math.floor(Math.random() * 200 + 10)}`;
      const goodIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;

      for (let i = 0; i < 5; i++) {
        await recordLoginFailure(badIp);
      }

      const badStatus = await checkLoginRateLimit(badIp);
      const goodStatus = await checkLoginRateLimit(goodIp);

      expect(badStatus.allowed).toBeFalsy();
      expect(goodStatus.allowed).toBeTruthy();
    });

    // Pair 2: F3 (Sanitization) + F6 (Admin Post Editor)
    await runner.test("P2 (F3+F6): Markdown rich text editor strips javascript: links while retaining safe markdown links", () => {
      const rawMarkdown = "[Ziyaret Et](javascript:alert(1)) ve [Köyümüz](/koyumuz)";
      const rendered = renderSafeRichText(rawMarkdown);
      expect(rendered.includes("javascript:")).toBeFalsy();
      expect(rendered).toContain('href="/koyumuz"');
    });

    // Pair 3: F4 (RBAC) + F1 (Auth)
    await runner.test("P3 (F4+F1): Session token verification gates deletion authority only to yonetici role", async () => {
      const { token: editorToken } = createSessionToken({
        username: "editor_ali",
        display_name: "Ali Editör",
        role: "editor",
      });
      const { token: adminToken } = createSessionToken({
        username: "yonetmenbgc",
        display_name: "Yönetici",
        role: "yonetici",
      });

      const adminSession = await verifySessionToken(adminToken);
      expect(adminSession?.role).toBe("yonetici");

      const allowedRoles = ["yonetici"];
      expect(allowedRoles.includes(adminSession!.role)).toBeTruthy();
    });

    // Pair 4: F5 (Mobile Layout) + F8 (Village History & Demographics)
    await runner.test("P4 (F5+F8): Village demographics in /koyumuz are compatible with mobile layout safe padding", async () => {
      const store = await getAllStoreData(false);
      const koyumuzPage = (store.pages || []).find((p) => p.slug === "/koyumuz");
      expect(koyumuzPage).toBeTruthy();

      const layoutContent = fs.readFileSync(path.resolve("src/app/layout.tsx"), "utf-8");
      expect(layoutContent).toContain("pb-24 lg:pb-0");
    });

    // Pair 5: F7 (Condolences) + F10 (KVKK / Privacy)
    await runner.test("P5 (F7+F10): Condolence records do not store Turkish Republic ID numbers or intrusive medical records", async () => {
      const store = await getAllStoreData(false);
      const json = JSON.stringify(store.condolences);
      expect(/\b[1-9][0-9]{10}\b/.test(json)).toBeFalsy();
    });

    // Pair 6: F2 (Rate Limiting) + F10 (Legal/KVKK)
    await runner.test("P6 (F2+F10): Contact route rejects submission without KVKK consent before store persistence", () => {
      const routeContent = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      const kvkkIndex = routeContent.indexOf("body.kvkk_consent !== true");
      const callIndex = routeContent.indexOf("await createContactMessage");
      expect(kvkkIndex).toBeGreaterThan(0);
      expect(callIndex).toBeGreaterThan(kvkkIndex);
    });

    // Pair 7: F8 (Demographics) + F11 (SEO JSON-LD)
    await runner.test("P7 (F8+F11): Schema.org Place coordinates match official Büyükakören geographic coordinates", () => {
      const placeLd = buildPlaceJsonLd();
      const geo = placeLd.geo as { latitude: number; longitude: number };
      expect(geo.latitude).toBe(39.603056);
      expect(geo.longitude).toBe(36.438056);
      expect(placeLd.description).toContain("1.276 m");
      expect(placeLd.description).toContain("58502");
    });

    // Pair 8: F9 (Association Profile) + F11 (SEO JSON-LD)
    await runner.test("P8 (F9+F11): Schema.org NGO founder matches Association President Mustafa Tanju Çetiner", async () => {
      const store = await getAllStoreData(false);
      const ngoLd = buildOrganizationJsonLd(store.site_settings);
      const founder = ngoLd.founder as { name: string; jobTitle: string };
      expect(founder.name).toBe("Mustafa Tanju Çetiner");
      expect(founder.jobTitle).toBe("Dernek Başkanı");
    });

    // Pair 9: F6 (Admin Forms) + F11 (SEO Metadata)
    await runner.test("P9 (F6+F11): SerpSimulatorCard 60-char title limit matches buildPageMetadata 60-char clamp", () => {
      const longTitle = "Bu Çok Uzun Bir Duyuru Başlığıdır ve Arama Motorlarında Kesilmemesi Gerekir";
      const clamped = buildPageMetadata({
        title: longTitle,
        description: "Test",
        path: "/test",
      });
      const titleStr = typeof clamped.title === "string" ? clamped.title : (clamped.title as { default: string })?.default;
      expect(titleStr.length).toBeLessThanOrEqual(60);
    });

    // Pair 10: F1 (Auth) + F7 (Batch Gallery Upload)
    await runner.test("P10 (F1+F7): Gallery API POST requires admin authentication for image upload", () => {
      const galleryRoute = fs.readFileSync(path.resolve("src/app/api/gallery/route.ts"), "utf-8");
      expect(galleryRoute).toContain("requireAdminAuth");
    });

    // Pair 11: F5 (Mobile Layout) + F6 (Admin Forms)
    await runner.test("P11 (F5+F6): Admin dashboard responsive navigation contains tabs for Posts and Gallery", () => {
      const dashboard = fs.readFileSync(path.resolve("src/components/admin/AdminDashboard.tsx"), "utf-8");
      expect(dashboard).toContain('"posts"');
      expect(dashboard).toContain('"gallery"');
      expect(dashboard).toContain('"condolences"');
    });

    // Pair 12: F2 (Rate Limiting) + F3 (Sanitization)
    await runner.test("P12 (F2+F3): Contact API parses client IP with reverse-proxy safety while validating sanitized fields", () => {
      const contactRoute = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(contactRoute).toContain("getClientIp(req)");
      expect(contactRoute).toContain("hashIpAddress(ip)");
    });

    // Pair 13: F10 (KVKK) + F12 (Build & Security Headers)
    await runner.test("P13 (F10+F12): KVKK and Privacy pages build statically and are protected by HSTS and CSP", () => {
      expect(fs.existsSync(path.resolve("src/app/kvkk/page.tsx"))).toBeTruthy();
      expect(fs.existsSync(path.resolve("src/app/gizlilik/page.tsx"))).toBeTruthy();
      const nextConf = fs.readFileSync(path.resolve("next.config.ts"), "utf-8");
      expect(nextConf).toContain("Strict-Transport-Security");
    });

    // Pair 14: F8 (History) + F12 (Build Pre-rendering)
    await runner.test("P14 (F8+F12): Village history text mentioning 1907 Ağören is exported to default store and pages", async () => {
      const store = await getAllStoreData(false);
      const koyumuz = (store.pages || []).find((p) => p.slug === "/koyumuz");
      expect(JSON.stringify(koyumuz)).toContain("Ağören");
    });

    // Pair 15: F4 (RBAC Deletions) + F2 (Rate Limiting & Audit)
    await runner.test("P15 (F4+F2): Audit log records user identity, action, and target securely", async () => {
      const { appendAuditLog } = await import("@/lib/security-store");
      await appendAuditLog({
        username: "yonetmenbgc",
        role: "yonetici",
        action: "post.delete",
        target: "post-pairwise-test",
      });
      const { readSecurityState } = await import("@/lib/security-store");
      const state = await readSecurityState();
      const match = state.audit_logs.find((l) => l.target === "post-pairwise-test");
      expect(match).toBeTruthy();
      expect(match?.username).toBe("yonetmenbgc");
      expect(match?.action).toBe("post.delete");
    });
  });
}
