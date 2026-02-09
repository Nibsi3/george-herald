const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");

const DELAY_MS = 400;
const FRONTEND_DATA = path.join(__dirname, "..", "frontend", "src", "data");
const ARTICLES_FILE = path.join(FRONTEND_DATA, "articles.json");
const ARTICLES_DIR = path.join(FRONTEND_DATA, "articles");

// All workspace websites to scrape
const WORKSPACES = [
  {
    id: "george-herald",
    name: "George Herald",
    baseUrl: "https://www.georgeherald.com",
    keywords: ["george", "garden route", "eden", "wilderness", "pacaltsdorp", "blanco", "heatherpark", "thembalethu"],
  },
  {
    id: "knysna-plett-herald",
    name: "Knysna-Plett Herald",
    baseUrl: "https://www.knysnaplettherald.com",
    keywords: ["knysna", "plett", "plettenberg", "sedgefield", "belvidere", "brenton"],
  },
  {
    id: "mossel-bay-advertiser",
    name: "Mossel Bay Advertiser",
    baseUrl: "https://www.mosselbayadvertiser.com",
    keywords: ["mossel bay", "mosselbaai", "hartenbos", "dana bay", "groot brakrivier", "klein brakrivier", "friemersheim"],
  },
  {
    id: "oudtshoorn-courant",
    name: "Oudtshoorn Courant",
    baseUrl: "https://www.oudtshoorncourant.com",
    keywords: ["oudtshoorn", "de rust", "dysselsdorp", "cango", "calitzdorp"],
  },
  {
    id: "graaff-reinet-advertiser",
    name: "Graaff-Reinet Advertiser",
    baseUrl: "https://www.graaffreinetadvertiser.com",
    keywords: ["graaff-reinet", "graaff reinet", "nieu-bethesda", "valley of desolation", "aberdeen", "karoo"],
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        timeout: 25000,
      });
      return res.data;
    } catch (err) {
      if (attempt < retries) {
        await sleep(2000);
        continue;
      }
      console.error(`  Failed to fetch ${url}: ${err.message}`);
      return null;
    }
  }
}

function getDateFromUrl(url) {
  const match = url.match(/-(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    return new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3]),
      parseInt(match[4]),
      parseInt(match[5])
    ).toISOString();
  }
  return null;
}

function getYearFromUrl(url) {
  const match = url.match(/-(\d{4})(\d{2})(\d{2})\d{4}$/);
  if (match) return parseInt(match[1]);
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
  if (url.includes("/Tourism/")) return "tourism";
  if (url.includes("/Entertainment")) return "entertainment";
  return "news";
}

function extractArticleLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();
  $('a[href*="/Article/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (href) {
      const full = href.startsWith("http") ? href : baseUrl + href;
      links.add(decodeURIComponent(full));
    }
  });
  return Array.from(links);
}

function parseArticle($, url, baseUrl) {
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

  // Get body
  let bodyText = "";
  const articleSelectors = [
    ".article-content-wrapper", ".article-body", ".article-content",
    '[itemprop="articleBody"]', ".ArticleBody", ".story-body", ".article_body",
  ];
  let contentEl = null;
  for (const sel of articleSelectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 50) {
      contentEl = el;
      break;
    }
  }
  if (!contentEl) {
    const mainCol = $(".col-lg-24").first();
    if (mainCol.length) {
      contentEl = mainCol.clone();
      contentEl.find("script, style, nav, .ad, .sidebar, .weatherblock, .NewsScroller, .ticker, .breakingNews").remove();
    }
  }

  // Extract structured content blocks
  const blocks = [];
  if (contentEl) {
    contentEl.find("script, style, .article_link_chain").remove();
    contentEl.children().each((_, child) => {
      const tag = child.tagName?.toLowerCase();
      const el = $(child);
      const text = el.text().trim();
      if (!text || text.length < 2) return;
      if (text === "Update" || text.startsWith("Read more about:")) return;
      if (text.startsWith("'We bring you the latest")) return;

      if (tag === "h2" || tag === "h3" || tag === "h4") {
        blocks.push({ type: "heading", text, level: tag });
      } else if (tag === "blockquote") {
        blocks.push({ type: "blockquote", text: el.find("p").length ? el.find("p").text().trim() : text });
      } else if (tag === "ul" || tag === "ol") {
        const items = [];
        el.find("li").each((_, li) => { const t = $(li).text().trim(); if (t) items.push(t); });
        if (items.length) blocks.push({ type: "list", items, ordered: tag === "ol" });
      } else {
        let html = el.html() || "";
        html = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/&nbsp;/g, " ").trim();
        if (html) blocks.push({ type: "paragraph", text, html });
      }
    });

    bodyText = blocks.map(b => {
      if (b.type === "heading") return "\n## " + b.text + "\n";
      if (b.type === "blockquote") return "\n> " + b.text + "\n";
      if (b.type === "list") return b.items.map(i => "- " + i).join("\n");
      return b.text;
    }).join("\n\n");
  }

  // Images - filter CMS images only
  const images = [];
  const badPatterns = [
    "SideBar", "sidebar", "logo", "Logo", "weather", "Weather",
    "WinnersBanners", "Press%20Reader", "paper-logo", "online-platforms",
    "edenmatchmaker", "google", "favicon", "Loader", "arrow-fb", "placeholder",
    "copyrightbar", "digitalplatforms", "localnewsnetwork",
    "twitterx.png", "facebook.png", "Youtube.png", "Instagram.png",
    "tiktok.png", "whatsapp.png", "rss.png",
  ];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    const alt = $(el).attr("alt") || "";
    if (!src) return;
    const fullSrc = src.startsWith("http") ? src : baseUrl + src;
    if (badPatterns.some(p => fullSrc.includes(p) || alt.includes(p))) return;
    const w = parseInt($(el).attr("width") || "999");
    const h = parseInt($(el).attr("height") || "999");
    if (w < 10 || h < 10) return;
    images.push({ url: fullSrc, alt });
  });

  // Author
  let author = "";
  for (const sel of [".author-name", ".article-author", '[rel="author"]', ".byline"]) {
    const el = $(sel);
    if (el.length) { author = el.text().trim(); break; }
  }
  if (!author && bodyText) {
    const m = bodyText.match(/Journalist\s+([A-Za-z\u00C0-\u00FF\s]+?)(?:\n|$)/);
    if (m) author = m[1].trim();
  }

  // Tags
  const tags = [];
  $('meta[name="keywords"]').each((_, el) => {
    const content = $(el).attr("content") || "";
    content.split(",").forEach(t => { const tag = t.trim(); if (tag && tag.length < 50) tags.push(tag); });
  });

  // Videos
  const videoUrls = [];
  $("iframe").each((_, el) => {
    const src = $(el).attr("src") || "";
    if (src && (src.includes("youtube") || src.includes("vimeo") || src.includes("facebook"))) videoUrls.push(src);
  });

  return {
    title,
    ogImage,
    ogDescription: ogDesc,
    bodyText: JSON.stringify(blocks),
    bodyTextPlain: bodyText,
    images,
    author,
    tags: [...new Set(tags)],
    videoUrls,
  };
}

async function scrapePagedListing(baseUrl, endpoint, query1, maxPages = 10) {
  const links = new Set();
  for (let page = 1; page <= maxPages; page++) {
    try {
      const params = new URLSearchParams();
      params.append("query1", query1);
      params.append("query2", "");
      params.append("page", page.toString());

      const res = await axios.post(baseUrl + endpoint, params.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest",
        },
        timeout: 20000,
      });

      const $ = cheerio.load(res.data);
      const pageLinks = [];
      $('a[href*="/Article/"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          const full = href.startsWith("http") ? href : baseUrl + href;
          if (!links.has(full)) pageLinks.push(full);
        }
      });

      if (pageLinks.length === 0) break;
      pageLinks.forEach(l => links.add(l));

      // Stop if all articles on this page are older than 2024
      let oldCount = 0;
      for (const link of pageLinks) {
        const year = getYearFromUrl(link);
        if (year && year < 2024) oldCount++;
      }
      if (oldCount === pageLinks.length) break;

      await sleep(200);
    } catch (err) {
      if (err.response?.status === 404) break;
      await sleep(1000);
    }
  }
  return links;
}

// Extract article links from RSS XML for any domain
function extractLinksFromRss(xml, baseUrl) {
  const links = new Set();
  const domain = baseUrl.replace("https://www.", "");
  const regex = /<link>(https?:\/\/[^<]*Article[^<]*)<\/link>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    if (match[1].includes(domain)) links.add(decodeURIComponent(match[1]));
  }
  // Also try <link> without domain filter for same-domain feeds
  const regex2 = /<link>([^<]+\/Article\/[^<]+)<\/link>/g;
  while ((match = regex2.exec(xml)) !== null) {
    const href = match[1].startsWith("http") ? match[1] : baseUrl + match[1];
    links.add(decodeURIComponent(href));
  }
  return Array.from(links);
}

async function scrapeWorkspace(workspace) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Scraping: ${workspace.name} (${workspace.baseUrl})`);
  console.log(`${"=".repeat(60)}`);

  const allLinks = new Set();

  // Method 1: RSS feeds for article discovery
  console.log(`  Scraping RSS feeds...`);
  const rssFeeds = [
    "/RSS/ArticleFeed/TopStories",
    "/RSS/ArticleFeed/News",
    "/RSS/ArticleFeed/Local%20News",
    "/RSS/ArticleFeed/Business",
    "/RSS/ArticleFeed/Crime",
    "/RSS/ArticleFeed/General%20News",
    "/RSS/ArticleFeed/Environment",
    "/RSS/ArticleFeed/Agriculture",
    "/RSS/ArticleFeed/Politics",
    "/RSS/ArticleFeed/LifeStyle",
    "/RSS/ArticleFeed/Entertainment",
    "/RSS/ArticleFeed/Entertainment%20News",
    "/RSS/ArticleFeed/Property",
    "/RSS/ArticleFeed/Schools",
    "/RSS/ArticleFeed/Sport",
    "/RSS/ArticleFeed/Latest%20Sport",
    "/RSS/ArticleFeed/Rugby",
    "/RSS/ArticleFeed/Cricket",
    "/RSS/ArticleFeed/Football",
    "/RSS/ArticleFeed/Golf",
    "/RSS/ArticleFeed/Tennis",
    "/RSS/ArticleFeed/Athletics",
    "/RSS/ArticleFeed/Other",
    "/RSS/ArticleFeed/National%20News",
    "/RSS/ArticleFeed/Motoring",
    "/RSS/ArticleFeed/Lifestyle",
  ];
  for (const feed of rssFeeds) {
    try {
      const res = await axios.get(workspace.baseUrl + feed, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        timeout: 15000,
      });
      const rssLinks = extractLinksFromRss(res.data, workspace.baseUrl);
      let added = 0;
      rssLinks.forEach(l => { if (!allLinks.has(l)) { allLinks.add(l); added++; } });
      if (added > 0) process.stdout.write(`    RSS ${feed.split('/').pop()}: +${added}  `);
    } catch (err) { /* silently skip */ }
    await sleep(150);
  }
  console.log(`\n    RSS total: ${allLinks.size}`);

  // Method 2: Paginated listings (POST API) - deep crawl
  console.log(`  Crawling paginated listings...`);
  const categories = [
    { endpoint: "/News/PagedListing", query1: "Top-Stories", label: "Top Stories" },
    { endpoint: "/News/PagedListing", query1: "Local-News", label: "Local News" },
    { endpoint: "/News/PagedListing", query1: "Crime", label: "Crime" },
    { endpoint: "/News/PagedListing", query1: "General-News", label: "General News" },
    { endpoint: "/News/PagedListing", query1: "Business", label: "Business" },
    { endpoint: "/News/PagedListing", query1: "National", label: "National" },
    { endpoint: "/News/PagedListing", query1: "Environment", label: "Environment" },
    { endpoint: "/News/PagedListing", query1: "Agriculture", label: "Agriculture" },
    { endpoint: "/News/PagedListing", query1: "Politics", label: "Politics" },
    { endpoint: "/News/PagedListing", query1: "LifeStyle", label: "Lifestyle" },
    { endpoint: "/News/PagedListing", query1: "Entertainment-News", label: "Entertainment News" },
    { endpoint: "/News/PagedListing", query1: "Property", label: "Property" },
    { endpoint: "/News/PagedListing", query1: "Schools", label: "Schools" },
    { endpoint: "/News/PagedListing", query1: "Motoring", label: "Motoring" },
    { endpoint: "/News/PagedListing", query1: "", label: "All News" },
    { endpoint: "/Sport/PagedListing", query1: "Rugby", label: "Rugby" },
    { endpoint: "/Sport/PagedListing", query1: "Cricket", label: "Cricket" },
    { endpoint: "/Sport/PagedListing", query1: "Football", label: "Football" },
    { endpoint: "/Sport/PagedListing", query1: "Golf", label: "Golf" },
    { endpoint: "/Sport/PagedListing", query1: "Athletics", label: "Athletics" },
    { endpoint: "/Sport/PagedListing", query1: "", label: "All Sport" },
    { endpoint: "/Entertainment/PagedListing", query1: "", label: "Entertainment" },
    { endpoint: "/Opinion/PagedListing", query1: "", label: "Opinion" },
    { endpoint: "/Community/PagedListing", query1: "", label: "Community" },
  ];

  for (const cat of categories) {
    try {
      const links = await scrapePagedListing(workspace.baseUrl, cat.endpoint, cat.query1, 50);
      let added = 0;
      for (const link of links) {
        if (!allLinks.has(link)) { allLinks.add(link); added++; }
      }
      if (links.size > 0) console.log(`    ${cat.label}: ${links.size} found, ${added} new`);
    } catch (err) {
      // Silently skip failed categories
    }
    await sleep(DELAY_MS);
  }

  // Method 3: Scrape listing pages directly
  console.log(`  Scraping listing pages...`);
  const listingPages = [
    "/News", "/News/Top-Stories", "/Sport", "/Entertainment",
    "/Opinion/Latest", "/Community", "/Letters",
  ];
  for (const page of listingPages) {
    const html = await fetchPage(workspace.baseUrl + page);
    if (html) {
      const links = extractArticleLinks(html, workspace.baseUrl);
      let added = 0;
      links.forEach(l => { if (!allLinks.has(l)) { allLinks.add(l); added++; } });
      if (added > 0) console.log(`    ${page}: +${added} new`);
    }
    await sleep(DELAY_MS);
  }

  // Filter to 2024-2026
  const recentLinks = [];
  let excluded = 0;
  for (const link of allLinks) {
    const year = getYearFromUrl(link);
    if (!year || year >= 2024) recentLinks.push(link);
    else excluded++;
  }
  console.log(`  Total links: ${allLinks.size}, Recent (2024+): ${recentLinks.length}, Excluded: ${excluded}`);

  return recentLinks;
}

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  WORKSPACE ARTICLE SCRAPER                       ║");
  console.log("║  Scraping latest news from all 5 Herald websites  ║");
  console.log("╚══════════════════════════════════════════════════╝");

  // Load existing articles
  const existingArticles = JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
  const existingSlugs = new Set(existingArticles.map(a => a.slug));
  const existingLinks = new Set(existingArticles.map(a => a.link).filter(Boolean));
  console.log(`\nExisting articles: ${existingArticles.length}`);

  let maxGuid = existingArticles.reduce((max, a) => Math.max(max, parseInt(a.guid) || 0), 0);
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalDuplicates = 0;

  // Skip george-herald - already fully scraped
  const subWorkspaces = WORKSPACES.filter(ws => ws.id !== "george-herald");
  for (const workspace of subWorkspaces) {
    const articleLinks = await scrapeWorkspace(workspace);

    console.log(`\n  Scraping ${articleLinks.length} article pages for ${workspace.name}...`);
    let wsAdded = 0;
    let wsSkipped = 0;
    let wsDuplicates = 0;

    for (let i = 0; i < articleLinks.length; i++) {
      const link = articleLinks[i];
      const slug = link.split("/").pop() || "";

      // Skip if already exists
      if (existingSlugs.has(slug) || existingLinks.has(link)) {
        wsDuplicates++;
        continue;
      }

      // For George Herald, skip articles that don't have GH-specific content
      // (all existing GH articles are already scraped, we only want new ones)

      const html = await fetchPage(link);
      if (!html) { wsSkipped++; continue; }

      const $ = cheerio.load(html);
      const articleData = parseArticle($, link, workspace.baseUrl);

      if (!articleData.title || articleData.title.length < 5) {
        wsSkipped++;
        continue;
      }

      // For non-GH workspaces, always accept articles from the workspace's own domain
      // Only check keywords for articles NOT from the workspace's domain
      const isFromDomain = link.includes(workspace.baseUrl.replace("https://www.", ""));
      if (!isFromDomain && workspace.id !== "george-herald") {
        const textToCheck = (articleData.title + " " + (articleData.ogDescription || "") + " " + (articleData.bodyTextPlain || "")).toLowerCase();
        const hasLocalKeyword = workspace.keywords.some(kw => textToCheck.includes(kw));
        if (!hasLocalKeyword) {
          wsSkipped++;
          continue;
        }
      }

      const section = extractSectionFromUrl(link);
      const category = extractCategoryFromUrl(link);
      const dateStr = getDateFromUrl(link);
      const featuredImg = articleData.images.find(img =>
        img.url.includes("cms.groupeditors.com")
      ) || articleData.images[0];

      maxGuid++;
      const newListing = {
        guid: String(maxGuid),
        link,
        title: articleData.title,
        description: articleData.ogDescription || "",
        updated: dateStr || new Date().toISOString(),
        section,
        category,
        isTopStory: workspace.id !== "george-herald",
        slug,
        featuredImage: featuredImg?.url || articleData.ogImage || "",
        author: articleData.author || "",
        tags: articleData.tags || [],
        hasVideo: articleData.videoUrls.length > 0,
        hasGallery: false,
        imageCount: articleData.images.length,
        workspace: workspace.id,
      };

      // Save listing
      existingArticles.unshift(newListing);
      existingSlugs.add(slug);
      existingLinks.add(link);

      // Save detail file
      const detailData = {
        title: articleData.title,
        description: articleData.ogDescription || "",
        bodyText: articleData.bodyText || "[]",
        images: articleData.images.map(img => ({ url: img.url, alt: img.alt || articleData.title })),
        author: articleData.author || "",
        tags: articleData.tags || [],
        videoUrls: articleData.videoUrls || [],
        galleryLink: "",
        ogImage: articleData.ogImage || "",
      };
      await fs.ensureDir(ARTICLES_DIR);
      await fs.writeJson(path.join(ARTICLES_DIR, `${slug}.json`), detailData, { spaces: 2 });

      wsAdded++;

      if ((i + 1) % 10 === 0) {
        console.log(`    [${i + 1}/${articleLinks.length}] Added: ${wsAdded} | Dupes: ${wsDuplicates} | Skipped: ${wsSkipped}`);
      }

      await sleep(DELAY_MS);
    }

    console.log(`\n  ${workspace.name} results:`);
    console.log(`    Added: ${wsAdded}`);
    console.log(`    Duplicates: ${wsDuplicates}`);
    console.log(`    Skipped: ${wsSkipped}`);

    totalAdded += wsAdded;
    totalSkipped += wsSkipped;
    totalDuplicates += wsDuplicates;
  }

  // Save updated articles.json
  console.log(`\nSaving ${existingArticles.length} articles to articles.json...`);
  await fs.writeJson(ARTICLES_FILE, existingArticles, { spaces: 2 });

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  SCRAPE COMPLETE                                  ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  Total added:      ${String(totalAdded).padStart(6)}                         ║`);
  console.log(`║  Total duplicates: ${String(totalDuplicates).padStart(6)}                         ║`);
  console.log(`║  Total skipped:    ${String(totalSkipped).padStart(6)}                         ║`);
  console.log(`║  Total articles:   ${String(existingArticles.length).padStart(6)}                         ║`);
  console.log("╚══════════════════════════════════════════════════╝");
}

main().catch(console.error);
