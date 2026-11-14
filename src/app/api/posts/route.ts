import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated, requireAdminAuth } from "@/lib/auth";
import { slugifyTR } from "@/lib/format";
import { notifyIndexNow } from "@/lib/indexnow";
import { appendAuditLog } from "@/lib/security-store";
import {
  createOrUpdatePost,
  deletePost,
  getAllStoreData,
  getPublishedPosts,
  getStoreVersion,
  VersionConflictError,
} from "@/lib/store";
import {
  ImageAttribution,
  PostCategory,
  ProjectStatus,
  PublishStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wantAll = searchParams.get("all") === "1";

  if (wantAll) {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { error: "Taslak içerikleri görüntülemek için yetki gerekir." },
        { status: 401 }
      );
    }
    const [data, version] = await Promise.all([
      getAllStoreData(true),
      getStoreVersion(),
    ]);
    return NextResponse.json(
      { posts: data.posts },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Store-Version": String(version),
        },
      }
    );
  }

  const [posts, version] = await Promise.all([
    getPublishedPosts(),
    getStoreVersion(),
  ]);
  return NextResponse.json(
    { posts },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Store-Version": String(version),
      },
    }
  );
}

export async function POST(req: Request) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await req.json()) as {
      id?: string;
      slug?: string;
      category: PostCategory;
      title: string;
      summary: string;
      content: string;
      image_url?: string | null;
      image_alt?: string | null;
      image_attribution?: ImageAttribution | null;
      attachment_url?: string | null;
      attachment_name?: string | null;
      project_status?: ProjectStatus | null;
      is_pinned?: boolean;
      is_published?: boolean;
      status?: PublishStatus;
      published_at?: string;
      seo_title?: string | null;
      seo_description?: string | null;
      expected_version?: number;
    };

    if (!body.title?.trim() || !body.summary?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Başlık, özet ve içerik alanları zorunludur." },
        { status: 400 }
      );
    }

    const baseSlug = slugifyTR(body.slug?.trim() || body.title) || "yazi";

    const saved = await createOrUpdatePost(
      {
        id: body.id,
        slug: baseSlug,
        category: body.category || "duyuru",
        title: body.title.trim(),
        summary: body.summary.trim(),
        content: body.content.trim(),
        image_url: body.image_url?.trim() || null,
        image_alt: body.image_alt?.trim() || null,
        image_attribution: body.image_attribution || null,
        attachment_url: body.attachment_url?.trim() || null,
        attachment_name: body.attachment_name?.trim() || null,
        project_status: body.project_status || null,
        is_pinned: Boolean(body.is_pinned),
        is_published: body.is_published !== false,
        status:
          body.status || (body.is_published === false ? "draft" : "published"),
        published_at: body.published_at || new Date().toISOString(),
        author_name: auth.session.displayName || "Dernek Yönetimi",
        seo_title: body.seo_title?.trim() || null,
        seo_description: body.seo_description?.trim() || null,
      },
      typeof body.expected_version === "number"
        ? body.expected_version
        : undefined
    );

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: body.id ? "post.update" : "post.create",
      target: saved.slug,
      detail: `${saved.category}: ${saved.title}`,
    });

    revalidatePath("/", "layout");
    revalidatePath("/duyurular");
    revalidatePath("/faaliyetler");
    revalidatePath(`/duyurular/${saved.slug}`);

    if (saved.is_published && saved.status !== "draft") {
      void notifyIndexNow([
        "/",
        "/duyurular",
        "/faaliyetler",
        `/duyurular/${saved.slug}`,
        "/sitemap.xml",
      ]);
    }

    return NextResponse.json({ post: saved, version: saved._version });
  } catch (err) {
    if (err instanceof VersionConflictError) {
      return NextResponse.json(
        { error: err.message, current_version: err.currentVersion },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: (err as Error).message || "Kayıt hatası." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminAuth();
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const verParam = searchParams.get("version");
  if (!id) {
    return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
  }

  try {
    await deletePost(id, verParam ? Number(verParam) : undefined);

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "post.delete",
      target: id,
    });

    revalidatePath("/", "layout");
    revalidatePath("/duyurular");
    revalidatePath("/faaliyetler");
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof VersionConflictError) {
      return NextResponse.json(
        { error: err.message, current_version: err.currentVersion },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Silinemedi." }, { status: 500 });
  }
}
