const FALLBACK_SITE_URL = "https://pdflovers.vercel.app";

const envSiteUrl =
  typeof import.meta !== "undefined" ? import.meta.env?.VITE_SITE_URL : "";

export const SITE_URL = String(envSiteUrl || FALLBACK_SITE_URL).replace(
  /\/+$/,
  ""
);
export const SITE_NAME = "PDF Lovers";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/preview.png`;
export const DEFAULT_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

const ABSOLUTE_URL_REGEX = /^https?:\/\//i;

export function toAbsoluteUrl(inputPath = "/") {
  const value = String(inputPath || "").trim();

  if (!value) return `${SITE_URL}/`;
  if (ABSOLUTE_URL_REGEX.test(value)) return value;

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function safeMetaText(value, fallback = "") {
  const clean = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  return clean || fallback;
}
