import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated, requireAdminAuth } from "@/lib/auth";
import { appendAuditLog } from "@/lib/security-store";
import {
  getPageBySlug,
  getPages,
  getStoreVersion,
  rollbackPageRevision,
  savePageConfig,
  VersionConflictError,
} from "@/lib/store";
import { PageBlock, PublishStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const isAdmin = await isAdminAuthenticated();

  if (slug) {
    const page = await getPageBySlug(slug, isAdmin);
    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ page }, { headers: NO_STORE });
  }

  const [pages, version] = await Promise.all([
    getPages(!isAdmin),
    getStoreVersion(),
  ]);
  return NextResponse.json(
    { pages, version },
    {
      headers: {
        ...NO_STORE,
        "X-Store-Version": String(version),
      },
    }
  );
}

export async function PUT(req: Request) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await req.json()) as {
      slug: string;
      title: string;
      seo_title?: string;
      seo_description?: string;
      og_image?: string;
      status?: PublishStatus;
      show_in_menu?: boolean;
      menu_order?: number;
      menu_label?: string;
      blocks: PageBlock[];
      expected_version?: number;
    };

    if (!body.slug?.trim() || !body.title?.trim() || !Array.isArray(body.blocks)) {
      return NextResponse.json(
        { error: "Sayfa adresi (slug), başlık ve blok listesi zorunludur." },
        { status: 400 }
      );
    }

    const cleanSlug =
      body.slug.trim() === "/"
        ? "/"
        : `/${body.slug
            .trim()
            .replace(/^\/+|\/+$/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9/-]+/g, "-")}`;

    const reservedPrefixes = ["/admin", "/yonetmenbgc", "/api", "/duyurular", "/faaliyetler", "/galeri", "/taziye"];
    if (
      cleanSlug !== "/" &&
      reservedPrefixes.some((p) => cleanSlug === p || cleanSlug.startsWith(`${p}/`))
    ) {
      return NextResponse.json(
        { error: "Bu URL yolu sistem tarafından ayrılmıştır." },
        { status: 400 }
      );
    }

    const { page, version } = await savePageConfig(
      {
        slug: cleanSlug,
        title: body.title.trim(),
        seo_title: body.seo_title?.trim() || undefined,
        seo_description: body.seo_description?.trim() || undefined,
        og_image: body.og_image?.trim() || undefined,
        status: body.status || "published",
        show_in_menu: Boolean(body.show_in_menu),
        menu_order:
          typeof body.menu_order === "number" ? body.menu_order : 20,
        menu_label: body.menu_label?.trim() || body.title.trim(),
        blocks: body.blocks,
      },
      auth.session.sub,
      typeof body.expected_version === "number"
        ? body.expected_version
        : undefined
    );

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "page.update",
      target: page.slug,
      detail: `${page.title} (${page.status}, ${page.blocks.length} blok)`,
    });

    revalidatePath("/", "layout");
    revalidatePath(page.slug);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ page, version }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof VersionConflictError) {
      return NextResponse.json(
        { error: err.message, current_version: err.currentVersion },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: (err as Error).message || "Sayfa kaydedilemedi." },
      { status: 500 }
    );
  }
}

export const POST = PUT;

export async function PATCH(req: Request) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await req.json()) as {
      action?: string;
      slug: string;
      revision_id: string;
      expected_version?: number;
    };

    if (body.action !== "rollback" || !body.slug || !body.revision_id) {
      return NextResponse.json(
        { error: "Geçersiz geri alma isteği." },
        { status: 400 }
      );
    }

    const { page, version } = await rollbackPageRevision(
      body.slug,
      body.revision_id,
      auth.session.sub,
      typeof body.expected_version === "number"
        ? body.expected_version
        : undefined
    );

    if (!page) {
      return NextResponse.json(
        { error: "Sürüm veya sayfa bulunamadı." },
        { status: 404 }
      );
    }

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "page.rollback",
      target: page.slug,
      detail: `Sürüm ID: ${body.revision_id}`,
    });

    revalidatePath("/", "layout");
    revalidatePath(page.slug);

    return NextResponse.json({ page, version }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof VersionConflictError) {
      return NextResponse.json(
        { error: err.message, current_version: err.currentVersion },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Sürüm geri yüklenemedi." },
      { status: 500 }
    );
  }
}
