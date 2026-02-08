import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/admin-auth";

const WORKSPACES_FILE = path.join(process.cwd(), "src", "data", "workspaces.json");

function readWorkspaces() {
  try {
    return JSON.parse(fs.readFileSync(WORKSPACES_FILE, "utf-8")) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function writeWorkspaces(workspaces: Record<string, unknown>[]) {
  fs.writeFileSync(WORKSPACES_FILE, JSON.stringify(workspaces, null, 2), "utf-8");
}

// GET: list all workspaces
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaces = readWorkspaces();
  // Filter to only workspaces the user has access to
  const filtered = workspaces.filter(
    (ws) => !session.workspaces?.length || session.workspaces.includes(ws.id as string)
  );

  return NextResponse.json({ workspaces: filtered });
}

// PUT: update workspace settings (hero articles, etc.)
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify user has access to this workspace
  if (session.workspaces?.length && !session.workspaces.includes(id)) {
    return NextResponse.json({ error: "Not authorized for this workspace" }, { status: 403 });
  }

  const workspaces = readWorkspaces();
  const idx = workspaces.findIndex((ws) => ws.id === id);
  if (idx === -1) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  // Only allow certain fields to be updated
  const allowed = ["heroArticleSlugs", "epaperLink", "whatsappLink", "communityLabel", "communityLink"];
  for (const field of allowed) {
    if (updates[field] !== undefined) {
      workspaces[idx][field] = updates[field];
    }
  }

  writeWorkspaces(workspaces);
  return NextResponse.json({ workspace: workspaces[idx] });
}
