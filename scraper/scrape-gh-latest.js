const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");

const BASE_URL = "https://www.georgeherald.com";
const FRONTEND_DATA = path.join(__dirname, "..", "frontend", "src", "data");
const ARTICLES_FILE = path.join(FRONTEND_DATA, "articles.json");
const ARTICLES_DIR = path.join(FRONTEND_DATA, "articles");
const DELAY_MS = 400;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
        timeout: 25000,
      });
      return res.data;
    } catch (err) {
      if (attempt < retries) { await sleep(2000); continue; }
      console.error(`  Failed: ${url}: ${err.message}`);
      return null;
    }
  }
}

function getDateFromUrl(url) {
  const match = url.match(/-(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), parseInt(match[4]), parseInt(match[5])).toISOString();
  }
  return null;
}

function extractCategoryFromUrl(url) {
  const match = url.match(/\/Article\/([^/]+)\//);
  if (match) return match[1].replace(/-/g, " ").toLowerCase().replace(/\s+/g, "-");
  return "general-news";
}

function extractSectionFromUrl(url) {
  if (url.includes("/Sport/")) return "sport";
  if (url.includes("/Opinion/") || url.includes("/Letters")) return "opinion";
  if (url.includes("/Schools/")) return "schools";
  if (url.includes("/Community/") || url.includes("/Municipal")) return "community";
  if (url.includes("/Entertainment")) return "entertainment";
  return "news";
}

function extractArticleLinks(html) {
  const $ = cheerio.load(html);
  const links = new Set();
  $('a[href*="/Article/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = href.startsWith("http") ? href : BASE_URL + href;
      if (full.includes("georgeherald.com")) links.add(decodeURIComponent(full));
    }
  });
  return Array.from(links);
}

function parseArticle($, url) {
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const ogDesc = $('meta[property="og:description"]').attr("content") || "";

  let title = ogTitle;
  if (!title || title.length < 5) {
    $(".col-lg-24 h2, .col-lg-24 h3, .col-lg-24 strong").each((_, el) => {
      const t = $(el).text().trim();
      if (t.length > 10 && t.length < 200 && !title) title = t;
    });
  }

  const articleSelectors = [".article-content-wrapper", ".article-body", ".article-content", '[itemprop="articleBody"]', ".ArticleBody", ".story-body"];
  let contentEl = null;
  for (const sel of articleSelectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 50) { contentEl = el; break; }
  }
  if (!contentEl) {
    const mainCol = $(".col-lg-24").first();
    if (mainCol.length) {
      contentEl = mainCol.clone();
      contentEl.find("script, style, nav, .ad, .sidebar").remove();
    }
  }

  const blocks = [];
  let bodyText = "";
  if (contentEl) {
    contentEl.find("script, style, .article_link_chain").remove();
    contentEl.children().each((_, child) => {
      const tag = child.tagName?.toLowerCase();
      const el = $(child);
      const text = el.text().trim();
      if (!text || text.length < 2) return;
      if (text === "Update" || text.startsWith("Read more about:")) return;
      if (tag === "h2" || tag === "h3" || tag === "h4") {
        blocks.push({ type: "heading", text, level: tag });
      } else if (tag === "blockquote") {
        blocks.push({ type: "blockquote", text });
      } else {
        let html = el.html() || "";
        html = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/&nbsp;/g, " ").trim();
        if (html) blocks.push({ type: "paragraph", text, html });
      }
    });
    bodyText = blocks.map(b => b.text).join("\n\n");
  }

  const images = [];
  const badPatterns = ["SideBar", "sidebar", "logo", "Logo", "weather", "WinnersBanners", "edenmatchmaker", "google", "favicon", "placeholder", "copyrightbar", "digitalplatforms"];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const alt = $(el).attr("alt") || "";
    if (!src) return;
    const fullSrc = src.startsWith("http") ? src : BASE_URL + src;
    if (badPatterns.some(p => fullSrc.includes(p) || alt.includes(p))) return;
    const w = parseInt($(el).attr("width") || "999");
    const h = parseInt($(el).attr("height") || "999");
    if (w < 10 || h < 10) return;
    images.push({ url: fullSrc, alt });
  });

  let author = "";
  for (const sel of [".author-name", ".article-author", '[rel="author"]', ".byline"]) {
    const el = $(sel);
    if (el.length) { author = el.text().trim(); break; }
  }

  const tags = [];
  $('meta[name="keywords"]').each((_, el) => {
    ($(el).attr("content") || "").split(",").forEach(t => { const tag = t.trim(); if (tag && tag.length < 50) tags.push(tag); });
  });

  const videoUrls = [];
  $("iframe").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (src && (src.includes("youtube") || src.includes("vimeo"))) videoUrls.push(src);
  });

  return { title, ogImage, ogDescription: ogDesc, bodyBlocks: JSON.stringify(blocks), bodyText, images, author, tags: [...new Set(tags)], videoUrls };
}

async function scrapePagedListing(endpoint, query1, maxPages = 10) {
  const links = new Set();
  for (let page = 1; page <= maxPages; page++) {
    try {
      const params = new URLSearchParams();
      params.append("query1", query1);
      params.append("query2", "");
      params.append("page", page.toString());
      const res = await axios.post(BASE_URL + endpoint, params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest" },
        timeout: 20000,
      });
      const $ = cheerio.load(res.data);
      const pageLinks = [];
      $('a[href*="/Article/"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href) { const full = href.startsWith("http") ? href : BASE_URL + href; if (!links.has(full)) pageLinks.push(full); }
      });
      if (pageLinks.length === 0) break;
      pageLinks.forEach(l => links.add(l));
      await sleep(200);
    } catch { break; }
  }
  return links;
}

async function main() {
  console.log("=== George Herald Latest Articles Scraper ===\n");

  const existingArticles = JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  const existingSlugs = new Set(existingArticles.map(a => a.slug));
  const existingLinks = new Set(existingArticles.map(a => a.link).filter(Boolean));
  console.log(`Existing articles: ${existingArticles.length}`);

  const allLinks = new Set();

  // Scrape multiple pages
  const pages = [
    "/News", "/News/Top-Stories", "/Sport", "/Entertainment",
    "/News/Article/Local-News", "/News/Article/Crime",
    "/Community/We-Care", "/Municipal-Notices",
  ];

  for (const p of pages) {
    const html = await fetchPage(BASE_URL + p);
    if (html) {
      const links = extractArticleLinks(html);
      links.forEach(l => allLinks.add(l));
      console.log(`  ${p}: ${links.length} links`);
    }
    await sleep(DELAY_MS);
  }

  // Also paginated listings for top categories
  const pagedCats = [
    { endpoint: "/News/PagedListing", query1: "Top-Stories" },
    { endpoint: "/News/PagedListing", query1: "Local-News" },
    { endpoint: "/News/PagedListing", query1: "Crime" },
    { endpoint: "/News/PagedListing", query1: "General-News" },
    { endpoint: "/News/PagedListing", query1: "Business" },
    { endpoint: "/News/PagedListing", query1: "Politics" },
    { endpoint: "/News/PagedListing", query1: "Agriculture" },
    { endpoint: "/News/PagedListing", query1: "Environment" },
    { endpoint: "/News/PagedListing", query1: "LifeStyle" },
    { endpoint: "/News/PagedListing", query1: "Property" },
    { endpoint: "/News/PagedListing", query1: "" },
    { endpoint: "/Sport/PagedListing", query1: "" },
    { endpoint: "/Entertainment/PagedListing", query1: "" },
    { endpoint: "/Community/PagedListing", query1: "" },
    { endpoint: "/MunicipalNotices/PagedListing", query1: "" },
  ];

  for (const cat of pagedCats) {
    const links = await scrapePagedListing(cat.endpoint, cat.query1, 3);
    links.forEach(l => allLinks.add(l));
    if (links.size > 0) process.stdout.write(`  Paged ${cat.query1 || cat.endpoint}: ${links.size}  `);
  }

  // Filter to only missing articles
  const missing = [];
  for (const link of allLinks) {
    const slug = link.split("/").pop() || "";
    if (!existingSlugs.has(slug) && !existingLinks.has(link)) missing.push(link);
  }

  console.log(`\n\nTotal links: ${allLinks.size}, Missing: ${missing.length}\n`);

  let maxGuid = existingArticles.reduce((max, a) => Math.max(max, parseInt(a.guid) || 0), 0);
  let added = 0;

  for (let i = 0; i < missing.length; i++) {
    const link = missing[i];
    const slug = link.split("/").pop() || "";
    const html = await fetchPage(link);
    if (!html) continue;

    const $ = cheerio.load(html);
    const data = parseArticle($, link);
    if (!data.title || data.title.length < 5) continue;

    const section = extractSectionFromUrl(link);
    const category = extractCategoryFromUrl(link);
    const dateStr = getDateFromUrl(link);
    const featuredImg = data.images.find(img => img.url.includes("cms.groupeditors.com")) || data.images[0];

    maxGuid++;
    existingArticles.unshift({
      guid: String(maxGuid),
      link,
      title: data.title,
      description: data.ogDescription || "",
      updated: dateStr || new Date().toISOString(),
      section,
      category,
      isTopStory: false,
      slug,
      featuredImage: featuredImg?.url || data.ogImage || "",
      author: data.author || "",
      tags: data.tags || [],
      hasVideo: data.videoUrls.length > 0,
      hasGallery: false,
      imageCount: data.images.length,
      workspace: "george-herald",
    });
    existingSlugs.add(slug);

    // Save detail file
    await fs.ensureDir(ARTICLES_DIR);
    await fs.writeJson(path.join(ARTICLES_DIR, `${slug}.json`), {
      title: data.title,
      description: data.ogDescription || "",
      bodyText: data.bodyBlocks || "[]",
      images: data.images.map(img => ({ url: img.url, alt: img.alt || data.title })),
      author: data.author || "",
      tags: data.tags || [],
      videoUrls: data.videoUrls || [],
      galleryLink: "",
      ogImage: data.ogImage || "",
    }, { spaces: 2 });

    added++;
    if ((i + 1) % 5 === 0) console.log(`  [${i + 1}/${missing.length}] Added: ${added}`);
    await sleep(DELAY_MS);
  }

  console.log(`\nAdded: ${added} new GH articles`);
  console.log(`Saving ${existingArticles.length} articles...`);
  await fs.writeJson(ARTICLES_FILE, existingArticles, { spaces: 2 });
  console.log("Done!");
}

main().catch(console.error);
