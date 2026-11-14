import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAllStoreData, updateSettingsAndBoard } from "@/lib/store";
import { BoardMember, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET() {
  const data = await getAllStoreData();
  return NextResponse.json(
    {
      site_settings: data.site_settings,
      board_members: data.board_members,
    },
    { headers: NO_STORE_HEADERS }
  );
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Yetkisiz erişim." },
      { status: 401, headers: NO_STORE_HEADERS }
    );
  }
  const body = (await req.json()) as {
    site_settings?: SiteSettings;
    board_members?: BoardMember[];
  };
  const updated = await updateSettingsAndBoard(
    body.site_settings,
    body.board_members
  );
  revalidatePath("/", "layout");
  return NextResponse.json(
    {
      site_settings: updated.site_settings,
      board_members: updated.board_members,
    },
    { headers: NO_STORE_HEADERS }
  );
}
