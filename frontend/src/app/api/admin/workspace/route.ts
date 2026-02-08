import { NextRequest, NextResponse } from "next/server";
import { getSession, switchWorkspace } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workspaceId } = await req.json();
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  const updated = await switchWorkspace(workspaceId);
  if (!updated) return NextResponse.json({ error: "Not authorized for this workspace" }, { status: 403 });

  return NextResponse.json({ session: updated });
}
