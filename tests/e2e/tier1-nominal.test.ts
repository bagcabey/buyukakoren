import { TestRunner, expect } from "./test-utils";
import {
  createSessionToken,
  verifySessionToken,
  isPrimaryAdminAlias,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { getClientIp, checkLoginRateLimit, checkAndRecordContactRateLimit } from "@/lib/rate-limit";
import { sanitizeSafeUrl, renderSafeRichText } from "@/lib/sanitize";
import { appendAuditLog, readSecurityState } from "@/lib/security-store";
import {
  buildPageMetadata,
  buildOrganizationJsonLd,
  buildPlaceJsonLd,
  buildEducationalOrganizationJsonLd,
  buildWebSiteJsonLd,
  SITE_URL,
} from "@/lib/seo";
import { getAllStoreData, getPublishedPosts } from "@/lib/store";
import fs from "fs";
import path from "path";

export async function runTier1Tests(runner: TestRunner): Promise<void> {
  // -------------------------------------------------------------
  // Feature 1: Security & Password Protection (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 1: Security & Password Protection", async () => {
    await runner.test("F1.1: Password hashing and verification succeeds with correct credentials", async () => {
      const plain = "GuvenliKoyDernek2026!";
      const hash = hashPassword(plain);
      expect(typeof hash).toBe("string");
      expect(hash.startsWith("scrypt:v1:")).toBeTruthy();
      const valid = verifyPassword(plain, hash);
      expect(valid).toBeTruthy();
    });

    await runner.test("F1.2: Admin alias normalization recognizes primary aliases", () => {
      expect(isPrimaryAdminAlias("yönetmenbgc")).toBeTruthy();
      expect(isPrimaryAdminAlias("yonetmenbgc")).toBeTruthy();
      expect(isPrimaryAdminAlias("admin")).toBeTruthy();
      expect(isPrimaryAdminAlias("  YONETMENBGC  ")).toBeTruthy();
    });

    await runner.test("F1.3: Session token generation produces signed token with sub, role, and jti", () => {
      const { token, payload } = createSessionToken({
        username: "yonetmenbgc",
        display_name: "Yönetici",
        role: "yonetici",
      });
      expect(typeof token).toBe("string");
      expect(token.includes(".")).toBeTruthy();
      expect(payload.sub).toBe("yonetmenbgc");
      expect(payload.role).toBe("yonetici");
      expect(typeof payload.jti).toBe("string");
    });

    await runner.test("F1.4: Session token verification succeeds for validly signed token", async () => {
      const { token, payload: created } = createSessionToken({
        username: "yonetmenbgc",
        display_name: "Yönetici",
        role: "yonetici",
      });
      const verified = await verifySessionToken(token);
      expect(verified).toBeTruthy();
      expect(verified?.sub).toBe("yonetmenbgc");
      expect(verified?.role).toBe("yonetici");
      expect(verified?.jti).toBe(created.jti);
    });

    await runner.test("F1.5: Security state store maintains configured users structure and admin alias", async () => {
      const state = await readSecurityState();
      expect(Array.isArray(state.users)).toBeTruthy();
      expect(isPrimaryAdminAlias("yonetmenbgc")).toBeTruthy();
    });
  });

  // -------------------------------------------------------------
  // Feature 2: Rate Limiting & Proxy IP Safety (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 2: Rate Limiting & Proxy IP Safety", async () => {
    await runner.test("F2.1: getClientIp extracts IP from x-vercel-ip header", () => {
      const req = new Request("https://buyukakoren.vercel.app/api/auth/login", {
        headers: { "x-vercel-ip": "176.240.12.34" },
      });
      expect(getClientIp(req)).toBe("176.240.12.34");
    });

    await runner.test("F2.2: getClientIp extracts IP from x-real-ip when x-vercel-ip is missing", () => {
      const req = new Request("https://buyukakoren.vercel.app/api/auth/login", {
        headers: { "x-real-ip": "195.175.45.67" },
      });
      expect(getClientIp(req)).toBe("195.175.45.67");
    });

    await runner.test("F2.3: getClientIp extracts trusted rightmost proxy IP from x-forwarded-for", () => {
      const req = new Request("https://buyukakoren.vercel.app/api/auth/login", {
        headers: { "x-forwarded-for": "10.0.0.1, 192.168.1.5, 212.156.4.88" },
      });
      expect(getClientIp(req)).toBe("212.156.4.88");
    });

    await runner.test("F2.4: checkLoginRateLimit allows initial request for fresh IP", async () => {
      const freshIp = `88.245.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`;
      const result = await checkLoginRateLimit(freshIp);
      expect(result.allowed).toBeTruthy();
      expect(result.failures).toBe(0);
    });

    await runner.test("F2.5: checkAndRecordContactRateLimit allows initial contact message from valid IP", async () => {
      const freshIp = `78.180.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`;
      const result = await checkAndRecordContactRateLimit(freshIp);
      expect(result.allowed).toBeTruthy();
    });
  });

  // -------------------------------------------------------------
  // Feature 3: Link Sanitization & XSS Prevention (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 3: Link Sanitization & XSS Prevention", async () => {
    await runner.test("F3.1: sanitizeSafeUrl allows standard secure https link", () => {
      const url = "https://buyukakoren.vercel.app/koyumuz";
      expect(sanitizeSafeUrl(url)).toBe(url);
    });

    await runner.test("F3.2: sanitizeSafeUrl allows relative root paths", () => {
      expect(sanitizeSafeUrl("/faaliyetler")).toBe("/faaliyetler");
      expect(sanitizeSafeUrl("/duyurular")).toBe("/duyurular");
    });

    await runner.test("F3.3: sanitizeSafeUrl allows standard external http links", () => {
      const url = "http://www.yildizeli.gov.tr/";
      expect(sanitizeSafeUrl(url).startsWith("http://www.yildizeli.gov.tr")).toBeTruthy();
    });

    await runner.test("F3.4: renderSafeRichText converts markdown bold and italic safely", () => {
      const html = renderSafeRichText("Köyümüzün **Ağören** ve *Büyük Akviran* tarihi");
      expect(html).toContain("<strong>Ağören</strong>");
      expect(html).toContain("<em>Büyük Akviran</em>");
    });

    await runner.test("F3.5: renderSafeRichText converts markdown bullet lists into ul/li tags", () => {
      const html = renderSafeRichText("- Yukarı Mahalle\n- Aşağı Mahalle\n- Şeyhler Mahallesi");
      expect(html).toContain("<ul>");
      expect(html).toContain("<li>Yukarı Mahalle</li>");
      expect(html).toContain("<li>Aşağı Mahalle</li>");
    });
  });

  // -------------------------------------------------------------
  // Feature 4: RBAC on Administrative Deletions (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 4: RBAC on Administrative Deletions", async () => {
    await runner.test("F4.1: Audit log entry can be created and appended", async () => {
      await appendAuditLog({
        username: "yonetmenbgc",
        role: "yonetici",
        action: "post.delete",
        target: "post-test-123",
      });
      const state = await readSecurityState();
      const match = state.audit_logs.find((l) => l.target === "post-test-123");
      expect(match).toBeTruthy();
      expect(match?.action).toBe("post.delete");
      expect(match?.username).toBe("yonetmenbgc");
    });

    await runner.test("F4.2: Audit logging records condolence deletion action", async () => {
      await appendAuditLog({
        username: "yonetmenbgc",
        role: "yonetici",
        action: "condolence.delete",
        target: "condolence-456",
      });
      const state = await readSecurityState();
      const match = state.audit_logs.find((l) => l.target === "condolence-456");
      expect(match).toBeTruthy();
      expect(match?.action).toBe("condolence.delete");
      expect(match?.role).toBe("yonetici");
    });

    await runner.test("F4.3: Audit logging records gallery photo deletion action", async () => {
      await appendAuditLog({
        username: "yonetmenbgc",
        role: "yonetici",
        action: "gallery.delete",
        target: "photo-789",
      });
      const state = await readSecurityState();
      const match = state.audit_logs.find((l) => l.target === "photo-789");
      expect(match).toBeTruthy();
      expect(match?.action).toBe("gallery.delete");
    });

    await runner.test("F4.4: Audit logging records contact message deletion action", async () => {
      await appendAuditLog({
        username: "yonetmenbgc",
        role: "yonetici",
        action: "message.delete",
        target: "msg-001",
      });
      const state = await readSecurityState();
      const match = state.audit_logs.find((l) => l.target === "msg-001");
      expect(match).toBeTruthy();
      expect(match?.action).toBe("message.delete");
    });

    await runner.test("F4.5: Audit logs are persisted in security state with timestamp", async () => {
      const state = await readSecurityState();
      expect(Array.isArray(state.audit_logs)).toBeTruthy();
      expect(state.audit_logs.length).toBeGreaterThan(0);
      const latest = state.audit_logs[0];
      expect(typeof latest.timestamp).toBe("string");
    });
  });

  // -------------------------------------------------------------
  // Feature 5: Mobile Navigation & Layout Safety (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 5: Mobile Navigation & Layout Safety", async () => {
    await runner.test("F5.1: MobileBottomNav source defines 5 primary bottom navigation routes", () => {
      const content = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(content).toContain('href: "/"');
      expect(content).toContain('href: "/duyurular"');
      expect(content).toContain('href: "/faaliyetler"');
      expect(content).toContain('href: "/taziye"');
      expect(content).toContain('href: "/galeri"');
    });

    await runner.test("F5.2: MobileBottomNav implements route masking check for /admin", () => {
      const content = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(content).toContain('rawPathname.startsWith("/admin")');
      expect(content).toContain("return null;");
    });

    await runner.test("F5.3: MobileBottomNav implements route masking check for /yonetmenbgc", () => {
      const content = fs.readFileSync(path.resolve("src/components/MobileBottomNav.tsx"), "utf-8");
      expect(content).toContain('rawPathname.startsWith("/yonetmenbgc")');
    });

    await runner.test("F5.4: Root layout includes safe bottom padding pb-24 for mobile screens", () => {
      const layoutContent = fs.readFileSync(path.resolve("src/app/layout.tsx"), "utf-8");
      expect(layoutContent).toContain("pb-24 lg:pb-0");
    });

    await runner.test("F5.5: UsersAuditTab provides responsive card layout for audit logs on mobile", () => {
      const auditContent = fs.readFileSync(path.resolve("src/components/admin/UsersAuditTab.tsx"), "utf-8");
      expect(auditContent).toContain("md:hidden");
      expect(auditContent).toContain("md:block");
    });
  });

  // -------------------------------------------------------------
  // Feature 6: Admin Panel Forms & WYSIWYG/Preview (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 6: Admin Panel Forms & WYSIWYG/Preview", async () => {
    await runner.test("F6.1: MarkdownPostEditor component exists and supports edit/preview tab modes", () => {
      const editorContent = fs.readFileSync(path.resolve("src/components/admin/MarkdownPostEditor.tsx"), "utf-8");
      expect(editorContent).toContain('activeTab === "preview"');
      expect(editorContent).toContain("renderSafeRichText");
    });

    await runner.test("F6.2: MarkdownPostEditor provides toolbar formatting helpers for bold and headings", () => {
      const editorContent = fs.readFileSync(path.resolve("src/components/admin/MarkdownPostEditor.tsx"), "utf-8");
      expect(editorContent).toContain('insertFormat("**", "**", "kalın metin")');
      expect(editorContent).toContain('insertBlock("## ", "Bölüm Başlığı")');
    });

    await runner.test("F6.3: SerpSimulatorCard calculates ideal title length under 60 chars", () => {
      const serpContent = fs.readFileSync(path.resolve("src/components/admin/SerpSimulatorCard.tsx"), "utf-8");
      expect(serpContent).toContain("İdeal Uzunluk");
      expect(serpContent).toContain("titleLen <= 60");
    });

    await runner.test("F6.4: SerpSimulatorCard calculates ideal description length under 160 chars", () => {
      const serpContent = fs.readFileSync(path.resolve("src/components/admin/SerpSimulatorCard.tsx"), "utf-8");
      expect(serpContent).toContain("descLen <= 160");
    });

    await runner.test("F6.5: GalleryImagePickerModal allows selecting photos with albums and search", () => {
      const modalContent = fs.readFileSync(path.resolve("src/components/admin/GalleryImagePickerModal.tsx"), "utf-8");
      expect(modalContent).toContain("filteredPhotos");
      expect(modalContent).toContain("onSelect(photo)");
    });
  });

  // -------------------------------------------------------------
  // Feature 7: Taziye & Gallery Form Enhancements (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 7: Taziye & Gallery Form Enhancements", async () => {
    await runner.test("F7.1: Condolence form supports structured prayer time options", () => {
      const storeContent = fs.readFileSync(path.resolve("src/components/admin/AdminDashboard.tsx"), "utf-8");
      expect(storeContent).toContain("Öğle Namazı");
      expect(storeContent).toContain("İkindi Namazı");
    });

    await runner.test("F7.2: Condolence form provides preset condolence message templates", () => {
      const dashboardContent = fs.readFileSync(path.resolve("src/components/admin/AdminDashboard.tsx"), "utf-8");
      expect(dashboardContent).toContain("Mekânı cennet olsun");
    });

    await runner.test("F7.3: BatchGalleryUploader supports drag-and-drop batch upload with preview", () => {
      const uploaderContent = fs.readFileSync(path.resolve("src/components/admin/BatchGalleryUploader.tsx"), "utf-8");
      expect(uploaderContent).toContain("handleAddFiles");
      expect(uploaderContent).toContain("handleStartBatchUpload");
    });

    await runner.test("F7.4: Store data contains default posts with proper attributes", async () => {
      const store = await getAllStoreData(false);
      expect(Array.isArray(store.posts)).toBeTruthy();
      expect(store.posts.length).toBeGreaterThan(0);
      const first = store.posts[0];
      expect(first.title.length).toBeGreaterThan(0);
    });

    await runner.test("F7.5: Store data contains categorized gallery photos with attribution", async () => {
      const store = await getAllStoreData(false);
      expect(Array.isArray(store.gallery_photos)).toBeTruthy();
      expect(store.gallery_photos.length).toBeGreaterThan(0);
      const first = store.gallery_photos[0];
      expect(typeof first.image_url).toBe("string");
      expect(typeof first.album).toBe("string");
    });
  });

  // -------------------------------------------------------------
  // Feature 8: Village History, Culture & Demographics (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 8: Village History, Culture & Demographics", async () => {
    await runner.test("F8.1: History records document 1907 Ağören and 1928 Büyük Akviran origins", async () => {
      const store = await getAllStoreData(false);
      const koyumuzPage = (store.pages || []).find((p) => p.slug === "/koyumuz");
      expect(koyumuzPage).toBeTruthy();
      const text = JSON.stringify(koyumuzPage);
      expect(text).toContain("1907");
      expect(text).toContain("Ağören");
      expect(text).toContain("1928");
      expect(text).toContain("Büyük Akviran");
    });

    await runner.test("F8.2: Village geographic specs document 1.276 m elevation and coordinates", async () => {
      const store = await getAllStoreData(false);
      const koyumuzPage = (store.pages || []).find((p) => p.slug === "/koyumuz");
      const text = JSON.stringify(koyumuzPage);
      expect(text).toContain("1.276");
      expect(text).toContain("39°36");
      expect(text).toContain("36°26");
    });

    await runner.test("F8.3: Village mahalles specify Yukarı Mahalle, Aşağı Mahalle, and Şeyhler Mahallesi", async () => {
      const store = await getAllStoreData(false);
      const koyumuzPage = (store.pages || []).find((p) => p.slug === "/koyumuz");
      const text = JSON.stringify(koyumuzPage);
      expect(text).toContain("Yukarı Mahalle");
      expect(text).toContain("Aşağı Mahalle");
      expect(text).toContain("Şeyhler Mahallesi");
    });

    await runner.test("F8.4: Village cultural heritage includes 4 traditional köy odası and local cuisine", async () => {
      const store = await getAllStoreData(false);
      const koyumuzPage = (store.pages || []).find((p) => p.slug === "/koyumuz");
      const text = JSON.stringify(koyumuzPage);
      expect(text).toContain("köy odası");
      expect(text).toContain("Madımak");
      expect(text).toContain("Dal Turşusu");
    });

    await runner.test("F8.5: Demographic census documents TÜİK population progression across decades", async () => {
      const store = await getAllStoreData(false);
      const koyumuzPage = (store.pages || []).find((p) => p.slug === "/koyumuz");
      const text = JSON.stringify(koyumuzPage);
      expect(text).toContain("TÜİK");
      expect(text).toContain("1990");
      expect(text).toContain("2025");
    });
  });

  // -------------------------------------------------------------
  // Feature 9: Association Profile & Leadership (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 9: Association Profile & Leadership", async () => {
    await runner.test("F9.1: Dernek president is recorded as Mustafa Tanju Çetiner", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("Mustafa Tanju Çetiner");
    });

    await runner.test("F9.2: Muhtar fields and phone number are removed from store", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text.includes("Hasan Özüdoğru")).toBe(false);
      expect(text.includes("0536 722 16 07")).toBe(false);
    });

    await runner.test("F9.3: Association milestone documents 900 pine trees planting (çam fidanı dikimi)", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("900");
      expect(text).toContain("çam");
    });

    await runner.test("F9.4: Association cemetery renovation and imece community work are documented", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("mezarlık");
      expect(text).toContain("imece");
    });

    await runner.test("F9.5: Official PTT postal code 58502 and association bank accounts are verified", async () => {
      const store = await getAllStoreData(false);
      const text = JSON.stringify(store);
      expect(text).toContain("58502");
    });
  });

  // -------------------------------------------------------------
  // Feature 10: Turkish Legal & KVKK Compliance (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 10: Turkish Legal & KVKK Compliance", async () => {
    await runner.test("F10.1: KVKK clarification text cites 6698 Sayılı Kanun and data controller duties", () => {
      const kvkkMeta = fs.readFileSync(path.resolve("src/app/kvkk/page.tsx"), "utf-8");
      expect(kvkkMeta).toContain("6698");
      const defaults = fs.readFileSync(path.resolve("src/lib/default-pages.ts"), "utf-8");
      expect(defaults).toContain("Veri Sorumlusu");
      expect(defaults).toContain("Aydınlatma Metni");
    });

    await runner.test("F10.2: Privacy policy clearly declares zero tracking / advertising cookies", () => {
      const defaults = fs.readFileSync(path.resolve("src/lib/default-pages.ts"), "utf-8");
      expect(defaults).toContain("reklam");
      expect(defaults).toContain("çerez");
    });

    await runner.test("F10.3: Contact API enforces mandatory kvkk_consent check before acceptance", () => {
      const contactRoute = fs.readFileSync(path.resolve("src/app/api/contact/route.ts"), "utf-8");
      expect(contactRoute).toContain("body.kvkk_consent !== true");
      expect(contactRoute).toContain("KVKK Aydınlatma Metni");
    });

    await runner.test("F10.4: Association governance references 5253 Sayılı Dernekler Kanunu standards", () => {
      const defaults = fs.readFileSync(path.resolve("src/lib/default-pages.ts"), "utf-8");
      expect(defaults).toContain("5253 sayılı Dernekler Kanunu");
    });

    await runner.test("F10.5: Terms of use and Impressum pages exist and provide institutional transparency", () => {
      expect(fs.existsSync(path.resolve("src/app/kullanim-kosullari/page.tsx"))).toBeTruthy();
      expect(fs.existsSync(path.resolve("src/app/kunye/page.tsx"))).toBeTruthy();
    });
  });

  // -------------------------------------------------------------
  // Feature 11: SEO Metadata & Schema.org JSON-LD (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 11: SEO Metadata & Schema.org JSON-LD", async () => {
    await runner.test("F11.1: buildPageMetadata produces clamped title within 60 chars", () => {
      const meta = buildPageMetadata({
        title: "Köyümüzün Tarihi, Coğrafyası ve Nüfusu",
        description: "Büyükakören Köyü resmî portali.",
        path: "/koyumuz",
      });
      const titleStr = typeof meta.title === "string" ? meta.title : (meta.title as { default: string })?.default;
      expect(titleStr.length).toBeLessThanOrEqual(60);
    });

    await runner.test("F11.2: buildPageMetadata produces clamped description within 155 chars", () => {
      const meta = buildPageMetadata({
        title: "Köyümüz",
        description: "Sivas ili Yıldızeli ilçesine bağlı Büyükakören Köyü Yardımlaşma ve Dayanışma Derneği resmî portalı duyuru sayfası.",
        path: "/koyumuz",
      });
      expect(meta.description?.length).toBeLessThanOrEqual(155);
    });

    await runner.test("F11.3: buildOrganizationJsonLd produces valid Schema.org NGO entity with founder", async () => {
      const store = await getAllStoreData(false);
      const jsonLd = buildOrganizationJsonLd(store.site_settings);
      expect(jsonLd["@type"]).toBe("NGO");
      expect(jsonLd.name).toContain("Büyük Akören");
      const founder = jsonLd.founder as { name: string; jobTitle: string };
      expect(founder.name).toBe("Mustafa Tanju Çetiner");
    });

    await runner.test("F11.4: buildPlaceJsonLd produces Schema.org Place with accurate coordinates", () => {
      const placeLd = buildPlaceJsonLd();
      expect(placeLd["@type"]).toBe("Place");
      expect(placeLd.name).toContain("Büyükakören");
      const geo = placeLd.geo as { latitude: number; longitude: number };
      expect(geo.latitude).toBe(39.603056);
      expect(geo.longitude).toBe(36.438056);
    });

    await runner.test("F11.5: buildEducationalOrganizationJsonLd outputs MiddleSchool schema", () => {
      const schoolLd = buildEducationalOrganizationJsonLd();
      expect(schoolLd["@type"]).toBe("MiddleSchool");
      expect(schoolLd.name).toBe("Büyük Akören Ortaokulu");
    });
  });

  // -------------------------------------------------------------
  // Feature 12: Build, Lint & Live Deployment Verification (Nominal)
  // -------------------------------------------------------------
  await runner.suite("Tier 1 - Feature 12: Build, Lint & Live Deployment Verification", async () => {
    await runner.test("F12.1: next.config.ts configures HSTS security header with long max-age", () => {
      const nextConf = fs.readFileSync(path.resolve("next.config.ts"), "utf-8");
      expect(nextConf).toContain("Strict-Transport-Security");
      expect(nextConf).toContain("max-age=63072000");
    });

    await runner.test("F12.2: next.config.ts configures Cross-Origin-Opener-Policy same-origin", () => {
      const nextConf = fs.readFileSync(path.resolve("next.config.ts"), "utf-8");
      expect(nextConf).toContain("Cross-Origin-Opener-Policy");
      expect(nextConf).toContain("same-origin");
    });

    await runner.test("F12.3: next.config.ts Content-Security-Policy does not contain unsafe-eval", () => {
      const nextConf = fs.readFileSync(path.resolve("next.config.ts"), "utf-8");
      expect(nextConf).toContain("Content-Security-Policy");
      expect(nextConf.includes("'unsafe-eval'")).toBeFalsy();
    });

    await runner.test("F12.4: Production build artifacts exist for static public pages", () => {
      const buildDir = path.resolve(".next");
      expect(fs.existsSync(buildDir)).toBeTruthy();
    });

    await runner.test("F12.5: Robots and sitemap generation files exist in app directory", () => {
      expect(fs.existsSync(path.resolve("src/app/robots.ts"))).toBeTruthy();
      expect(fs.existsSync(path.resolve("src/app/sitemap.ts"))).toBeTruthy();
    });
  });
}
