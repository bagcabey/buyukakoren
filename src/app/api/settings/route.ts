import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { isValidTurkishIban } from "@/lib/format";
import { appendAuditLog } from "@/lib/security-store";
import {
  getAllStoreData,
  getStoreVersion,
  updateSettingsAndBoard,
  VersionConflictError,
} from "@/lib/store";
import { BoardMember, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET() {
  const [data, version] = await Promise.all([
    getAllStoreData(false),
    getStoreVersion(),
  ]);
  return NextResponse.json(
    {
      site_settings: data.site_settings,
      board_members: data.board_members,
      version,
    },
    { headers: NO_STORE_HEADERS }
  );
}

export async function PUT(req: Request) {
  const auth = await requireAdminAuth(["yonetici"]);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await req.json()) as {
      site_settings?: SiteSettings;
      board_members?: BoardMember[];
      expected_version?: number;
    };

    if (
      body.site_settings &&
      typeof body.site_settings.iban_number === "string" &&
      body.site_settings.iban_number.trim() !== ""
    ) {
      if (!isValidTurkishIban(body.site_settings.iban_number)) {
        return NextResponse.json(
          {
            error:
              "Girilen IBAN numarası geçersiz. Lütfen 'TR' ile başlayan 26 haneli geçerli bir Türk IBAN numarası girin (veya boş bırakın).",
          },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
    }

    const sanitizedSettings = body.site_settings
      ? { ...body.site_settings, ataturk_ribbon_visible: true }
      : undefined;

    const updated = await updateSettingsAndBoard(
      sanitizedSettings,
      body.board_members,
      typeof body.expected_version === "number"
        ? body.expected_version
        : undefined
    );

    await appendAuditLog({
      username: auth.session.sub,
      role: auth.session.role,
      action: "settings.update",
      target: "site_settings",
    });

    revalidatePath("/", "layout");
    revalidatePath("/bagis");
    revalidatePath("/dernek");
    revalidatePath("/iletisim");
    revalidatePath("/koyumuz");

    return NextResponse.json(
      {
        site_settings: updated.site_settings,
        board_members: updated.board_members,
        version: updated.version,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    if (err instanceof VersionConflictError) {
      return NextResponse.json(
        { error: err.message, current_version: err.currentVersion },
        { status: 409, headers: NO_STORE_HEADERS }
      );
    }
    return NextResponse.json(
      { error: (err as Error).message || "Ayarlar kaydedilemedi." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
