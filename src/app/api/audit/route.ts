import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/auth";
import { readSecurityState } from "@/lib/security-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminAuth(["yonetici"]);
  if (auth.errorResponse) return auth.errorResponse;

  const secState = await readSecurityState();
  return NextResponse.json(
    { logs: secState.audit_logs },
    { headers: { "Cache-Control": "no-store" } }
  );
}
