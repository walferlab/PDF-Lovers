import type { Metadata } from "next";

import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/constants";
import { absoluteUrl, getSiteUrl } from "@/lib/url";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}

export function buildMetadata({ title, description, path, image }: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const ogImage = image || absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function getRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "Read cinema guides, streaming breakdowns, and production-ready long-form posts with search, related posts, and anonymous feedback.",
    alternates: {
      canonical: absoluteUrl("/"),
    },
    openGraph: {
      title: SITE_NAME,
      description:
        "Read cinema guides, streaming breakdowns, and production-ready long-form posts with search, related posts, and anonymous feedback.",
      url: absoluteUrl("/"),
      siteName: SITE_NAME,
      images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE) }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description:
        "Read cinema guides, streaming breakdowns, and production-ready long-form posts with search, related posts, and anonymous feedback.",
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
  };
}
