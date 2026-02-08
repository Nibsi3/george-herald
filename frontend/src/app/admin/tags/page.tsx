"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tags, Search, X, ArrowUpDown } from "lucide-react";

interface TagInfo {
  name: string;
  count: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "name">("count");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/articles?limit=99999");
      const data = await res.json();
      const articles = data.articles || [];

      const tagMap: Record<string, number> = {};
      for (const a of articles) {
        const articleTags = a.tags as string[];
        if (articleTags) {
          for (const t of articleTags) {
            const key = t.toLowerCase().trim();
            if (key) tagMap[key] = (tagMap[key] || 0) + 1;
          }
        }
      }

      const tagList: TagInfo[] = Object.entries(tagMap).map(([name, count]) => ({ name, count }));
      tagList.sort((a, b) => b.count - a.count);
      setTags(tagList);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = tags
    .filter((t) => !search || t.name.includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "count") return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

  const topTags = tags.slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tags</h1>
        <p className="text-sm text-gray-500 mt-0.5">{tags.length.toLocaleString()} unique tags</p>
      </div>

      {/* Tag cloud - top 20 */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Most Used Tags</h2>
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => {
              const maxCount = topTags[0]?.count || 1;
              const ratio = tag.count / maxCount;
              const size = ratio > 0.6 ? "text-base" : ratio > 0.3 ? "text-sm" : "text-xs";
              return (
                <Link
                  key={tag.name}
                  href={`/admin/articles?search=${encodeURIComponent(tag.name)}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#DC2626] hover:text-[#DC2626] transition-colors font-medium text-gray-600 ${size}`}
                >
                  {tag.name}
                  <span className="text-[10px] text-gray-400 font-normal">({tag.count})</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setSortBy(sortBy === "count" ? "name" : "count")}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortBy === "count" ? "By count" : "A-Z"}
        </button>
      </div>

      {/* Tag list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_80px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div>Tag</div>
          <div className="text-right">Articles</div>
          <div></div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">Loading tags...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No tags found</div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {filtered.map((tag) => (
              <div
                key={tag.name}
                className="grid grid-cols-[1fr_80px_80px] gap-4 px-5 py-2.5 hover:bg-gray-50 transition-colors items-center"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Tags className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">{tag.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 tabular-nums">{tag.count}</span>
                </div>
                <div className="text-right">
                  <Link
                    href={`/admin/articles?search=${encodeURIComponent(tag.name)}`}
                    className="text-xs font-semibold text-[#DC2626] hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
