import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated, requireAdminAuth } from "@/lib/auth";
import { appendAuditLog } from "@/lib/security-store";
import {
  createCondolence,
  deleteCondolence,
  getAllStoreData,
  getStoreVersion,
  VersionConflictError,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wantAll = searchParams.get("all") === "1";

  if (wantAll) {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json(
        { error: "Taslak taziyeleri görüntülemek için yetki gerekir." },
        { status: 401 }
      );
    }
    const [data, version] = await Promise.all([
      getAllStoreData(true),
      getStoreVersion(),
    ]);
    return NextResponse.json(
      { condolences: data.condolences },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Store-Version": String(version),
        },
      }
    );
  }

  const [data, version] = await Promise.all([
    getAllStoreData(false),
    getStoreVersion(),
  ]);
  return NextResponse.json(
    { condolences: data.condolences },
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
      deceased_name: string;
      age_or_note?: string;
      funeral_date: string;
      burial_place?: string;
      message: string;
      relatives?: string;
      image_url?: string | null;
      is_published?: boolean;
      family_consent_confirmed?: boolean;
      expected_version?: number;
    };

    if (!body.deceased_name?.trim() || !body.funeral_date?.trim()) {
      return NextResponse.json(
        { error: "Vefat eden adı ve cenaze tarihi zorunludur." },
        { status: 400 }
      );
    }

    if (body.family_consent_confirmed === false) {
      return NextResponse.json(
        { error: "Taziye yayını için yakınların rızası işaretlenmelidir." },
        { status: 400 }
      );
    }

    const created = await createCondolence(
      {
        id: body.id,
        deceased_name: body.deceased_name.trim(),
        age_or_note: body.age_or_note?.trim() || null,
        funeral_date: body.funeral_date.trim(),
        burial_place: body.burial_place?.trim() || null,
        message:
          body.message?.trim() ||
          "Merhuma/Merhumeye Allah'tan rahmet, kederli ailesine başsağlığı dileriz.",
        relatives: body.relatives?.trim() || null,
        image_url: body.image_url?.trim() || null,
        is_published: body.is_published !== false,
        family_consent_confirmed: Boolean(body.family_consent_confirmed ?? true),
      },
      typeof body.expected_version === "number"
        ? body.expected_version
        : undefined
    );

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: body.id ? "condolence.update" : "condolence.create",
      target: created.id,
      detail: created.deceased_name,
    });

    revalidatePath("/", "layout");
    revalidatePath("/taziye");
    return NextResponse.json({ condolence: created });
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
  const auth = await requireAdminAuth(["yonetici"]);
  if (auth.errorResponse) return auth.errorResponse;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const verParam = searchParams.get("version");
  if (!id) {
    return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
  }

  try {
    await deleteCondolence(id, verParam ? Number(verParam) : undefined);

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "condolence.delete",
      target: id,
    });

    revalidatePath("/", "layout");
    revalidatePath("/taziye");
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
