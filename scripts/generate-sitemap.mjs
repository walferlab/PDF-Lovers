import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const OUTPUT_PATH = path.join(ROOT, "public", "sitemap.xml");

function loadLocalEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return;

  const content = fs.readFileSync(ENV_PATH, "utf8");
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toCategoryArray(category) {
  if (Array.isArray(category)) {
    return category.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof category === "string") {
    const trimmed = category.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item || "").trim()).filter(Boolean);
        }
      } catch {
        // Keep compatibility with old single-string rows.
      }
    }

    return [trimmed];
  }

  if (category && typeof category === "object") {
    return Object.values(category)
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return [];
}

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

async function fetchAllRows(supabase, table, columns) {
  const pageSize = 1000;
  let from = 0;
  let allRows = [];

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, to);

    if (error) {
      throw error;
    }

    const rows = data || [];
    allRows = allRows.concat(rows);

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

async function fetchAllRowsWithFallback(supabase, table, columnSets) {
  let lastError = null;

  for (const columns of columnSets) {
    try {
      const rows = await fetchAllRows(supabase, table, columns);
      return rows;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Failed to fetch ${table}`);
}

function toUrlEntry(baseUrl, routePath, options = {}) {
  const loc = `${baseUrl}${routePath}`;
  return {
    loc,
    lastmod: options.lastmod || null,
    changefreq: options.changefreq || null,
    priority: options.priority || null,
  };
}

function buildXml(entries) {
  const body = entries
    .map((entry) => {
      const lines = [
        "  <url>",
        `    <loc>${xmlEscape(entry.loc)}</loc>`,
      ];

      if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) lines.push(`    <priority>${entry.priority}</priority>`);

      lines.push("  </url>");
      return lines.join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    "</urlset>",
    "",
  ].join("\n");
}

async function main() {
  loadLocalEnvFile();

  const baseUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || "https://pdflovers.vercel.app")
    .replace(/\/+$/, "");

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  const staticEntries = [
    toUrlEntry(baseUrl, "/", { changefreq: "daily", priority: "1.0" }),
    toUrlEntry(baseUrl, "/categories", { changefreq: "daily", priority: "0.9" }),
    toUrlEntry(baseUrl, "/trending-pdfs", { changefreq: "daily", priority: "0.8" }),
    toUrlEntry(baseUrl, "/popular-pdfs", { changefreq: "daily", priority: "0.8" }),
    toUrlEntry(baseUrl, "/privacy-policy", { changefreq: "monthly", priority: "0.3" }),
  ];

  let dynamicEntries = [];

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const books = await fetchAllRowsWithFallback(supabase, "books", [
      "id,category,created_at,updated_at,title",
      "id,category,created_at,title",
    ]);

    const bookEntries = books
      .filter((b) => b?.id)
      .map((book) =>
        toUrlEntry(baseUrl, `/pdf/${book.id}`, {
          lastmod: normalizeDate(book.updated_at || book.created_at),
          changefreq: "weekly",
          priority: "0.9",
        })
      );

    const categoryLatestDate = new Map();
    for (const book of books) {
      const date = normalizeDate(book.updated_at || book.created_at);
      if (!date) continue;

      for (const category of toCategoryArray(book?.category)) {
        const prev = categoryLatestDate.get(category);
        if (!prev || new Date(date).getTime() > new Date(prev).getTime()) {
          categoryLatestDate.set(category, date);
        }
      }
    }

    const categoryEntries = [...categoryLatestDate.entries()].map(([category, lastmod]) =>
      toUrlEntry(baseUrl, `/category/${slugify(category)}`, {
        lastmod,
        changefreq: "daily",
        priority: "0.8",
      })
    );

    dynamicEntries = [...bookEntries, ...categoryEntries];
  } else {
    console.warn(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Generating static sitemap only."
    );
  }

  const deduped = new Map();
  for (const entry of [...staticEntries, ...dynamicEntries]) {
    deduped.set(entry.loc, entry);
  }

  const sortedEntries = [...deduped.values()].sort((a, b) => a.loc.localeCompare(b.loc));
  const xml = buildXml(sortedEntries);
  fs.writeFileSync(OUTPUT_PATH, xml, "utf8");

  console.log(`Sitemap updated: ${OUTPUT_PATH}`);
  console.log(`Total URLs: ${deduped.size}`);
}

main().catch((error) => {
  console.error("Failed to generate sitemap:", error.message || error);
  process.exit(1);
});
