import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSession } from "@/lib/admin-auth";

const ARTICLES_FILE = path.join(process.cwd(), "src", "data", "articles.json");

// GET: return top tags with counts
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8")) as Record<string, unknown>[];

  const tagMap: Record<string, number> = {};
  for (const a of articles) {
    const tags = a.tags as string[];
    if (tags) {
      for (const t of tags) {
        const key = t.toLowerCase().trim();
        if (key) tagMap[key] = (tagMap[key] || 0) + 1;
      }
    }
  }

  const allTags = Object.entries(tagMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    tags: allTags,
    topTags: allTags.slice(0, 30).map((t) => t.name),
  });
}
