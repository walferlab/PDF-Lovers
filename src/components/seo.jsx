import { useEffect } from "react";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_ROBOTS,
  SITE_NAME,
  toAbsoluteUrl,
  safeMetaText,
} from "../lib/seo";

function upsertMetaTag(selector, attributes, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

export default function Seo({
  title,
  description,
  pathname = "/",
  canonical,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  robots = DEFAULT_ROBOTS,
  keywords = "",
  structuredData = null,
}) {
  useEffect(() => {
    const fullTitle = safeMetaText(title) || `${SITE_NAME} | Free PDF Books and Study Materials`;
    const cleanDescription = safeMetaText(
      description,
      "Discover and download free PDF books, notes, journals, and exam study materials on PDF Lovers."
    );
    const cleanKeywords = safeMetaText(
      keywords,
      "PDF Lovers, free pdf books, pdf notes, journals pdf, download pdf books, free study materials, exam notes pdf"
    );
    const canonicalUrl = toAbsoluteUrl(canonical || pathname);
    const imageUrl = toAbsoluteUrl(image);
    const robotsValue = safeMetaText(robots, DEFAULT_ROBOTS);

    document.title = fullTitle;

    upsertMetaTag('meta[name="description"]', { name: "description" }, cleanDescription);
    upsertMetaTag('meta[name="robots"]', { name: "robots" }, robotsValue);
    upsertMetaTag('meta[name="author"]', { name: "author" }, SITE_NAME);
    upsertMetaTag('meta[property="og:type"]', { property: "og:type" }, type);
    upsertMetaTag('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
    upsertMetaTag('meta[property="og:title"]', { property: "og:title" }, fullTitle);
    upsertMetaTag(
      'meta[property="og:description"]',
      { property: "og:description" },
      cleanDescription
    );
    upsertMetaTag('meta[property="og:url"]', { property: "og:url" }, canonicalUrl);
    upsertMetaTag('meta[property="og:image"]', { property: "og:image" }, imageUrl);
    upsertMetaTag('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title" }, fullTitle);
    upsertMetaTag(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      cleanDescription
    );
    upsertMetaTag('meta[name="twitter:image"]', { name: "twitter:image" }, imageUrl);

    upsertMetaTag('meta[name="keywords"]', { name: "keywords" }, cleanKeywords);

    upsertCanonical(canonicalUrl);

    document
      .querySelectorAll('script[type="application/ld+json"][data-seo-jsonld="true"]')
      .forEach((node) => node.remove());

    const payload = Array.isArray(structuredData)
      ? structuredData.filter(Boolean)
      : structuredData
      ? [structuredData]
      : [];

    payload.forEach((entry) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "true";
      script.textContent = JSON.stringify(entry);
      document.head.appendChild(script);
    });
  }, [canonical, description, image, keywords, pathname, robots, structuredData, title, type]);

  return null;
}
