import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VIEWS_FILE = path.join(process.cwd(), "src", "data", "views.json");

function readViews(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(VIEWS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeViews(views: Record<string, number>) {
  fs.writeFileSync(VIEWS_FILE, JSON.stringify(views), "utf-8");
}

// POST: increment view count for an article slug
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }

    const views = readViews();
    views[slug] = (views[slug] || 0) + 1;
    writeViews(views);

    return NextResponse.json({ views: views[slug] });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// GET: get view count for a slug
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ views: 0 });

  const views = readViews();
  return NextResponse.json({ views: views[slug] || 0 });
}
