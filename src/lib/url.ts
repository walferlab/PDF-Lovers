import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!envUrl) {
    return "http://localhost:3000";
  }

  return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function getDefaultOgImage() {
  return absoluteUrl(DEFAULT_OG_IMAGE);
}

export function getDefaultSeo() {
  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  };
}
