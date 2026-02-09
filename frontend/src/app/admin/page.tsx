import fs from "fs";
import path from "path";
import Link from "next/link";
import { FileText, FolderTree, Tags, TrendingUp, Clock, Star, Zap } from "lucide-react";
import { cookies } from "next/headers";

const PARENT_WORKSPACE = "george-herald";

function getStats(activeWorkspace: string) {
  const articlesFile = path.join(process.cwd(), "src", "data", "articles.json");
  let articles = JSON.parse(fs.readFileSync(articlesFile, "utf-8")) as Record<string, unknown>[];

  // Filter articles by active workspace — each workspace only sees its own articles
  articles = articles.filter((a) => {
    const ws = (a.workspace as string) || PARENT_WORKSPACE;
    return ws === activeWorkspace;
  });

  const total = articles.length;
  const topStories = articles.filter((a) => a.isTopStory).length;

  // Sections breakdown
  const sections: Record<string, number> = {};
  for (const a of articles) {
    const s = (a.section as string) || "unknown";
    sections[s] = (sections[s] || 0) + 1;
  }

  // Categories breakdown
  const categories: Record<string, number> = {};
  for (const a of articles) {
    const c = (a.category as string) || "uncategorized";
    categories[c] = (categories[c] || 0) + 1;
  }

  // Tags
  const tagSet = new Set<string>();
  for (const a of articles) {
    const tags = a.tags as string[];
    if (tags) tags.forEach((t) => tagSet.add(t.toLowerCase()));
  }

  // Recent articles (last 7 days)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = articles.filter((a) => {
    const d = new Date(a.updated as string).getTime();
    return d > weekAgo;
  });

  // Top 10 most recent (deduplicated by slug)
  const seenSlugs = new Set<string>();
  const latest = articles
    .sort((a, b) => new Date(b.updated as string).getTime() - new Date(a.updated as string).getTime())
    .filter((a) => {
      const s = a.slug as string;
      if (seenSlugs.has(s)) return false;
      seenSlugs.add(s);
      return true;
    })
    .slice(0, 10);

  return {
    total,
    topStories,
    sections,
    categories,
    tagCount: tagSet.size,
    recentCount: recent.length,
    latest,
    sectionCount: Object.keys(sections).length,
    categoryCount: Object.keys(categories).length,
    topCategories: Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
  };
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const activeWorkspace = cookieStore.get("gh_workspace")?.value || PARENT_WORKSPACE;
  const stats = getStats(activeWorkspace);

  const cards = [
    { label: "Total Articles", value: stats.total.toLocaleString(), icon: FileText, color: "bg-blue-500", href: "/admin/articles" },
    { label: "Top Stories", value: stats.topStories, icon: Star, color: "bg-amber-500", href: "/admin/articles?filter=top" },
    { label: "This Week", value: stats.recentCount, icon: Clock, color: "bg-green-500", href: "/admin/articles" },
    { label: "Categories", value: stats.categoryCount, icon: FolderTree, color: "bg-purple-500", href: "/admin/categories" },
    { label: "Sections", value: stats.sectionCount, icon: Zap, color: "bg-[#DC2626]", href: "/admin/categories" },
    { label: "Tags", value: stats.tagCount.toLocaleString(), icon: Tags, color: "bg-teal-500", href: "/admin/tags" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your {activeWorkspace === PARENT_WORKSPACE ? "George Herald" : activeWorkspace.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} content</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group"
          >
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${card.color} text-white mb-3`}>
              <card.icon className="h-4.5 w-4.5" />
            </div>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Latest articles */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#DC2626]" />
              Latest Articles
            </h2>
            <Link href="/admin/articles" className="text-xs font-semibold text-[#DC2626] hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.latest.map((article) => (
              <Link
                key={article.slug as string}
                href={`/admin/articles/${article.slug}`}
                className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                {article.featuredImage ? (
                  <img
                    src={article.featuredImage as string}
                    alt=""
                    className="w-14 h-10 object-cover rounded-md shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-14 h-10 bg-gray-100 rounded-md shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{article.title as string}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium text-[#DC2626] bg-red-50 px-1.5 py-0.5 rounded">
                      {article.section as string}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(article.updated as string).toLocaleDateString("en-ZA")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-purple-500" />
              Top Categories
            </h2>
            <Link href="/admin/categories" className="text-xs font-semibold text-[#DC2626] hover:underline">
              Manage →
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {stats.topCategories.map(([cat, count]) => {
              const pct = Math.round((count / stats.total) * 100);
              return (
                <div key={cat} className="group">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{cat.replace(/-/g, " ")}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#DC2626] rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-[#B91C1C] transition-colors"
          >
            <FileText className="h-4 w-4" />
            New Article
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FolderTree className="h-4 w-4" />
            Manage Categories
          </Link>
          <Link
            href="/admin/tags"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Tags className="h-4 w-4" />
            Manage Tags
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Live Site ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
