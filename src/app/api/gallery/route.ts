import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { appendAuditLog } from "@/lib/security-store";
import {
  createGalleryPhoto,
  deleteGalleryPhoto,
  getAllStoreData,
  getStoreVersion,
  VersionConflictError,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [data, version] = await Promise.all([
    getAllStoreData(false),
    getStoreVersion(),
  ]);
  return NextResponse.json(
    { gallery_photos: data.gallery_photos },
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
      title: string;
      album: string;
      image_url: string;
      image_alt?: string;
      taken_year?: string;
      description?: string;
      attribution_author?: string;
      attribution_license?: string;
      attribution_url?: string;
      source_url?: string;
      expected_version?: number;
    };

    if (!body.title?.trim() || !body.image_url?.trim()) {
      return NextResponse.json(
        { error: "Başlık ve görsel adresi zorunludur." },
        { status: 400 }
      );
    }

    const created = await createGalleryPhoto(
      {
        id: body.id,
        title: body.title.trim(),
        album: body.album?.trim() || "Yıldızeli ve Çevresi",
        image_url: body.image_url.trim(),
        image_alt: body.image_alt?.trim() || body.title.trim(),
        taken_year: body.taken_year?.trim() || null,
        description: body.description?.trim() || null,
        attribution_author: body.attribution_author?.trim() || null,
        attribution_license: body.attribution_license?.trim() || null,
        attribution_url: body.attribution_url?.trim() || null,
        source_url: body.source_url?.trim() || null,
      },
      typeof body.expected_version === "number"
        ? body.expected_version
        : undefined
    );

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "gallery.add",
      target: created.id,
      detail: created.title,
    });

    revalidatePath("/", "layout");
    revalidatePath("/galeri");
    return NextResponse.json({ photo: created });
  } catch (err) {
    if (err instanceof VersionConflictError) {
      return NextResponse.json(
        { error: err.message, current_version: err.currentVersion },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: (err as Error).message || "Fotoğraf eklenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdminAuth(["yonetici"]);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const verParam = searchParams.get("version");
  if (!id) {
    return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
  }

  try {
    await deleteGalleryPhoto(id, verParam ? Number(verParam) : undefined);

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "gallery.delete",
      target: id,
    });

    revalidatePath("/", "layout");
    revalidatePath("/galeri");
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
