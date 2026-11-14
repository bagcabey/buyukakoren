import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { slugifyTR } from "@/lib/format";
import { createOrUpdatePost, deletePost, getAllStoreData } from "@/lib/store";
import { PostCategory, ProjectStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAllStoreData();
  return NextResponse.json({ posts: data.posts });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      id?: string;
      category: PostCategory;
      title: string;
      summary: string;
      content: string;
      image_url?: string | null;
      attachment_url?: string | null;
      project_status?: ProjectStatus | null;
      is_pinned?: boolean;
      is_published?: boolean;
      published_at?: string;
    };

    if (!body.title?.trim() || !body.summary?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Başlık, özet ve içerik alanları zorunludur." },
        { status: 400 }
      );
    }

    const baseSlug = slugifyTR(body.title) || "yazi";
    const slug = body.id ? baseSlug : `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const saved = await createOrUpdatePost({
      id: body.id,
      slug,
      category: body.category || "duyuru",
      title: body.title.trim(),
      summary: body.summary.trim(),
      content: body.content.trim(),
      image_url: body.image_url?.trim() || null,
      attachment_url: body.attachment_url?.trim() || null,
      project_status: body.project_status || null,
      is_pinned: Boolean(body.is_pinned),
      is_published: body.is_published !== false,
      published_at: body.published_at || new Date().toISOString(),
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ post: saved });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Kayıt hatası." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
  }
  await deletePost(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
