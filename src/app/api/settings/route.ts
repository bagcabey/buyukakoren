import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getAllStoreData,
  saveBoardMembers,
  updateSiteSettings,
} from "@/lib/store";
import { BoardMember, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAllStoreData();
  return NextResponse.json({
    site_settings: data.site_settings,
    board_members: data.board_members,
  });
}

export async function PUT(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  const body = (await req.json()) as {
    site_settings?: SiteSettings;
    board_members?: BoardMember[];
  };
  if (body.site_settings) {
    await updateSiteSettings(body.site_settings);
  }
  if (body.board_members) {
    await saveBoardMembers(body.board_members);
  }
  revalidatePath("/", "layout");
  const updated = await getAllStoreData();
  return NextResponse.json({
    site_settings: updated.site_settings,
    board_members: updated.board_members,
  });
}
