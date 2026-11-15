import { TestRunner, expect } from "./test-utils";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  checkAndRecordContactRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { sanitizeSafeUrl, renderSafeRichText } from "@/lib/sanitize";
import {
  buildPageMetadata,
  buildPlaceJsonLd,
  buildOrganizationJsonLd,
  SITE_URL,
} from "@/lib/seo";
import {
  getAllStoreData,
  createCondolence,
} from "@/lib/store";
import { appendAuditLog, readSecurityState } from "@/lib/security-store";
import fs from "fs";
import path from "path";

export async function runTier4Tests(runner: TestRunner): Promise<void> {
  await runner.suite("Tier 4 - Real-World Application Workload Scenarios", async () => {
    // Scenario 1: Admin Login -> Draft Post with Markdown & Gallery Picker -> Preview -> Publish
    await runner.test("Scenario 1: Admin Login -> Draft Post with Markdown & Gallery Picker -> Preview -> Publish", async () => {
      // Step 1: Admin authenticates
      const password = "AdminSecretPassword2026!";
      const hash = await hashPassword(password);
      const isAuthValid = await verifyPassword(password, hash);
      expect(isAuthValid).toBeTruthy();

      const { token, payload } = createSessionToken({
        username: "yonetmenbgc",
        display_name: "Yönetici",
        role: "yonetici",
      });
      expect(payload.role).toBe("yonetici");

      // Step 2: Prepare draft post with markdown content & hero image from gallery
      const markdownBody = `## Köyümüzün Ağaçlandırma Hamlesi\n\nDerneğimiz öncülüğünde **900 adet çam fidanı** toprakla buluştu.\n\n- Yer: Yukarı Mahalle Mezarlık Mevkii\n- Katılımcılar: Tüm köylülerimiz ve dernek üyeleri\n\nDetaylı bilgi için [Duyurular](/duyurular) sayfamızı takip ediniz.`;
      const renderedHtml = renderSafeRichText(markdownBody);
      expect(renderedHtml).toContain("<h2>Köyümüzün Ağaçlandırma Hamlesi</h2>");
      expect(renderedHtml).toContain("<strong>900 adet çam fidanı</strong>");
      expect(renderedHtml).toContain('href="/duyurular"');

      // Step 3: SERP Preview Clamping check
      const serpMeta = buildPageMetadata({
        title: "Köyümüzün Ağaçlandırma Hamlesi: 900 Çam Fidanı Toprakla Buluştu",
        description: "Büyükakören Köyü Derneği fidan dikim faaliyeti raporu.",
        path: "/duyurular/agaclandirma-hamlesi",
      });
      const titleStr = typeof serpMeta.title === "string" ? serpMeta.title : (serpMeta.title as { default: string })?.default;
      expect(titleStr.length).toBeLessThanOrEqual(60);

      // Step 4: Audit log for publication
      await appendAuditLog({
        username: payload.sub,
        role: payload.role,
        action: "post.create",
        target: "agaclandirma-hamlesi",
      });
      const state = await readSecurityState();
      const match = state.audit_logs.find((l) => l.target === "agaclandirma-hamlesi");
      expect(match).toBeTruthy();
      expect(match?.action).toBe("post.create");
      expect(match?.username).toBe("yonetmenbgc");
    });

    // Scenario 2: Public Visitor browses /koyumuz on Mobile -> Reads History & 3 Mahalle -> Checks School & Muhtar info
    await runner.test("Scenario 2: Public Visitor browses /koyumuz on Mobile without layout clipping", async () => {
      // Step 1: Verify layout has safe bottom padding on mobile
      const layoutContent = fs.readFileSync(path.resolve("src/app/layout.tsx"), "utf-8");
      expect(layoutContent).toContain("pb-24 lg:pb-0");

      // Step 2: Verify MobileBottomNav is displayed on public pages
      const navContent = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(navContent).toContain('href: "/duyurular"');
      expect(navContent).toContain('href: "/galeri"');

      // Step 3: Verify village history data
      const store = await getAllStoreData(false);
      const koyumuz = (store.pages || []).find((p) => p.slug === "/koyumuz");
      expect(koyumuz).toBeTruthy();
      const content = JSON.stringify(koyumuz);
      expect(content).toContain("1907");
      expect(content).toContain("Ağören");
      expect(content).toContain("1928");
      expect(content).toContain("Büyük Akviran");

      // Step 4: Verify 3 mahalle and school & muhtar
      expect(content).toContain("Yukarı Mahalle");
      expect(content).toContain("Aşağı Mahalle");
      expect(content).toContain("Şeyhler Mahallesi");
      expect(content).toContain("Hasan Özüdoğru");
      expect(content).toContain("Büyük Akören Ortaokulu");
    });

    // Scenario 3: Visitor opens /iletisim -> submits message with KVKK consent -> Rate limiting checks -> Admin reads message
    await runner.test("Scenario 3: Visitor opens /iletisim -> submits message with KVKK consent -> Rate limit check", async () => {
      const visitorIp = `88.250.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`;
      const req = new Request("https://buyukakoren.vercel.app/api/contact", {
        headers: { "x-vercel-ip": visitorIp },
      });
      const resolvedIp = getClientIp(req);
      expect(resolvedIp).toBe(visitorIp);

      // Check initial rate limit
      const rateLimitStatus = await checkAndRecordContactRateLimit(resolvedIp);
      expect(rateLimitStatus.allowed).toBeTruthy();

      // Ensure KVKK consent requirement
      const contactRouteContent = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(contactRouteContent).toContain("body.kvkk_consent !== true");
    });

    // Scenario 4: Admin adds Condolence with funeral prayer time & photo -> checks public /taziye
    await runner.test("Scenario 4: Admin adds Condolence with funeral prayer time & photo -> checks public /taziye", async () => {
      // Step 1: Verify condolence form supports prayer times (Öğle / İkindi)
      const dashboardContent = fs.readFileSync(path.resolve("src/components/admin/AdminDashboard.tsx"), "utf-8");
      expect(dashboardContent).toContain("Öğle Namazı");
      expect(dashboardContent).toContain("İkindi Namazı");

      const storePath = path.resolve("data/store.json");
      const originalStoreContent = fs.existsSync(storePath) ? fs.readFileSync(storePath, "utf-8") : null;

      try {
        // Step 2: Admin creates a structured condolence with funeral details
        const created = await createCondolence({
          id: "cond-e2e-scenario-test",
          deceased_name: "Merhum Hacı Mehmet Demir",
          funeral_date: "2026-11-15",
          age_or_note: "Öğle Namazına Müteakip",
          burial_place: "Büyükakören Köyü Yukarı Mahalle Mezarlığı",
          message: "Merhuma Allah'tan rahmet, kederli ailesine başsağlığı dileriz.",
          relatives: "Ali Demir (Oğlu)",
          is_published: true,
          family_consent_confirmed: true,
        });

        expect(created.deceased_name).toBe("Merhum Hacı Mehmet Demir");
        expect(created.age_or_note).toBe("Öğle Namazına Müteakip");

        // Step 3: Verify condolence appears in public store data
        const store = await getAllStoreData(false);
        expect(store.condolences.length).toBeGreaterThan(0);
        const found = store.condolences.find((c) => c.id === "cond-e2e-scenario-test");
        expect(found).toBeTruthy();
        expect(found?.burial_place).toContain("Büyükakören");

        // Step 4: Verify /taziye page file exists
        expect(fs.existsSync(path.resolve("src/app/taziye/page.tsx"))).toBeTruthy();
      } finally {
        // Teardown: revert data/store.json to preserve clean working tree
        if (originalStoreContent !== null && fs.existsSync(storePath)) {
          fs.writeFileSync(storePath, originalStoreContent, "utf-8");
        }
      }
    });

    // Scenario 5: Anonymous attacker attempts XSS link in block or brute-forces login with spoofed IP -> blocked
    await runner.test("Scenario 5: Anonymous attacker attempts XSS link and login brute-force -> blocked", async () => {
      // Step 1: XSS attempt
      const maliciousPayload = 'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>';
      const sanitizedUrl = sanitizeSafeUrl(maliciousPayload);
      expect(sanitizedUrl).toBe("");

      // Step 2: Login brute force attempt
      const attackerIp = `185.220.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`;
      for (let i = 0; i < 5; i++) {
        await recordLoginFailure(attackerIp);
      }

      // Step 3: Verify attacker IP is strictly blocked
      const limit = await checkLoginRateLimit(attackerIp);
      expect(limit.allowed).toBeFalsy();
      expect(limit.retryAfterSec).toBeGreaterThan(0);
    });
  });
}
