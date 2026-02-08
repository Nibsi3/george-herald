"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ImageIcon, Search, X, ExternalLink, Copy, Check } from "lucide-react";

interface ImageInfo {
  url: string;
  alt: string;
  articleSlug: string;
  articleTitle: string;
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 40;

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/articles?limit=500");
      const data = await res.json();
      const articles = data.articles || [];

      const imgs: ImageInfo[] = [];
      for (const a of articles) {
        if (a.featuredImage) {
          imgs.push({
            url: a.featuredImage,
            alt: a.title,
            articleSlug: a.slug,
            articleTitle: a.title,
          });
        }
      }
      setImages(imgs);
      setLoading(false);
    }
    load();
  }, []);

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  const filtered = images.filter(
    (img) =>
      !search ||
      img.articleTitle.toLowerCase().includes(search.toLowerCase()) ||
      img.url.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Media Library</h1>
        <p className="text-sm text-gray-500 mt-0.5">{images.length.toLocaleString()} images from articles</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by article title or URL..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none bg-white"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading images...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {paginated.map((img, idx) => (
              <div
                key={`${img.url}-${idx}`}
                className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-gray-100">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => copyUrl(img.url)}
                    className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {copiedUrl === img.url ? (
                      <><Check className="h-3 w-3 text-green-600" /> Copied!</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy URL</>
                    )}
                  </button>
                  <Link
                    href={`/admin/articles/${img.articleSlug}`}
                    className="inline-flex items-center gap-1.5 bg-[#DC2626] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#B91C1C] transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" /> Edit Article
                  </Link>
                </div>
                {/* Title */}
                <div className="p-2">
                  <p className="text-[11px] text-gray-500 truncate">{img.articleTitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
