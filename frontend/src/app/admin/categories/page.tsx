"use client";

import { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronRight,
} from "lucide-react";

interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
  section: string;
}

const SECTIONS = [
  { key: "news", label: "News", categories: ["top-stories", "local-news", "national-news", "business", "crime", "agriculture", "politics", "property", "environment", "elections", "general-news"] },
  { key: "sport", label: "Sport", categories: ["rugby", "cricket", "football", "golf", "tennis", "athletics", "other-sport", "latest"] },
  { key: "entertainment", label: "Entertainment", categories: ["entertainment", "culture", "tourism"] },
  { key: "opinion", label: "Opinion", categories: ["comment", "blogs"] },
  { key: "community", label: "Community", categories: ["we-care", "heritage", "academic", "general-notices"] },
  { key: "lifestyle", label: "Lifestyle", categories: ["lifestyle"] },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>("news");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSection, setNewSection] = useState("news");
  const [showNewForm, setShowNewForm] = useState(false);
  const [reassigning, setReassigning] = useState<{ from: string; to: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/admin/articles?limit=99999");
    const data = await res.json();
    const articles = data.articles || [];

    const catMap: Record<string, { count: number; section: string }> = {};
    for (const a of articles) {
      const cat = a.category || "uncategorized";
      const sec = a.section || "news";
      if (!catMap[cat]) catMap[cat] = { count: 0, section: sec };
      catMap[cat].count++;
    }

    const cats: CategoryInfo[] = Object.entries(catMap).map(([slug, info]) => ({
      name: slug.replace(/-/g, " "),
      slug,
      count: info.count,
      section: info.section,
    }));
    cats.sort((a, b) => b.count - a.count);
    setCategories(cats);
    setLoading(false);
  }

  function getCategoriesForSection(sectionKey: string) {
    const section = SECTIONS.find((s) => s.key === sectionKey);
    if (!section) return [];
    return section.categories.map((slug) => {
      const existing = categories.find((c) => c.slug === slug);
      return existing || { name: slug.replace(/-/g, " "), slug, count: 0, section: sectionKey };
    });
  }

  async function handleReassign() {
    if (!reassigning) return;
    // Fetch all articles in the "from" category and reassign them
    const res = await fetch(`/api/admin/articles?category=${reassigning.from}&limit=99999`);
    const data = await res.json();
    for (const article of data.articles || []) {
      await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: article.slug, category: reassigning.to }),
      });
    }
    setReassigning(null);
    fetchCategories();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories across {SECTIONS.length} sections</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="inline-flex items-center gap-2 bg-[#DC2626] text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-[#B91C1C] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Category
        </button>
      </div>

      {/* New category form */}
      {showNewForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Add New Category</h3>
          <div className="flex gap-3">
            <select
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              {SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#DC2626] focus:border-[#DC2626] outline-none"
              placeholder="Category name (e.g. Local News)"
            />
            <button
              onClick={() => {
                if (newCategory.trim()) {
                  const slug = newCategory.trim().toLowerCase().replace(/\s+/g, "-");
                  setCategories([...categories, { name: newCategory.trim(), slug, count: 0, section: newSection }]);
                  setNewCategory("");
                  setShowNewForm(false);
                }
              }}
              className="px-4 py-2 bg-[#DC2626] text-white text-sm font-semibold rounded-lg hover:bg-[#B91C1C]"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Reassign modal */}
      {reassigning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-amber-800 mb-2">Reassign Articles</h3>
          <p className="text-sm text-amber-700 mb-3">
            Move all articles from <strong>{reassigning.from.replace(/-/g, " ")}</strong> to:
          </p>
          <div className="flex gap-3">
            <select
              value={reassigning.to}
              onChange={(e) => setReassigning({ ...reassigning, to: e.target.value })}
              className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
            >
              {categories
                .filter((c) => c.slug !== reassigning.from)
                .map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
            </select>
            <button onClick={handleReassign} className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700">
              Reassign
            </button>
            <button onClick={() => setReassigning(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections with categories */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading categories...</div>
      ) : (
        <div className="space-y-4">
          {SECTIONS.map((section) => {
            const sectionCats = getCategoriesForSection(section.key);
            const totalInSection = sectionCats.reduce((sum, c) => sum + c.count, 0);
            const isExpanded = expandedSection === section.key;

            return (
              <div key={section.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.key)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  <FolderTree className="h-4 w-4 text-[#DC2626]" />
                  <span className="font-bold text-gray-900">{section.label}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    {sectionCats.length} categories · {totalInSection.toLocaleString()} articles
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {sectionCats.map((cat) => (
                      <div
                        key={cat.slug}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#DC2626]/30" />
                        {editingSlug === cat.slug ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                // Update category name display
                                setCategories(categories.map((c) => c.slug === cat.slug ? { ...c, name: editName } : c));
                                setEditingSlug(null);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditingSlug(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 text-sm font-medium text-gray-700 capitalize">{cat.name}</span>
                            <span className="text-xs text-gray-400 tabular-nums">{cat.count.toLocaleString()} articles</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setEditingSlug(cat.slug); setEditName(cat.name); }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Rename"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {cat.count > 0 && (
                                <button
                                  onClick={() => setReassigning({ from: cat.slug, to: categories.find((c) => c.slug !== cat.slug)?.slug || "" })}
                                  className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  title="Reassign articles"
                                >
                                  <FolderTree className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {cat.count === 0 && (
                                <button
                                  onClick={() => setCategories(categories.filter((c) => c.slug !== cat.slug))}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
