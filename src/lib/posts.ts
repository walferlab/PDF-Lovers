import { cache } from "react";

import {
  POSTS_PER_PAGE,
  RELATED_POST_LIMIT,
  SIDEBAR_POST_LIMIT,
} from "@/lib/constants";
import { cleanSearchInput } from "@/lib/utils";
import { createPublicServerClient } from "@/lib/supabase/server";
import type { Post, PostListResult, PostStats } from "@/types/blog";

const POST_SELECT =
  "id,title,slug,excerpt,content_markdown,cover_image_url,author_name,category_slug,tags,status,featured,published_at,updated_at,created_at,reading_time_minutes,post_stats(view_count,like_count,dislike_count,updated_at,post_id)";

function normalizeStats(value: unknown): PostStats | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    return normalizeStats(value[0]);
  }

  const stats = value as Partial<PostStats>;
  if (!stats.post_id) {
    return null;
  }

  return {
    post_id: stats.post_id,
    view_count: Number(stats.view_count ?? 0),
    like_count: Number(stats.like_count ?? 0),
    dislike_count: Number(stats.dislike_count ?? 0),
    updated_at: stats.updated_at,
  };
}

function normalizePost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: (row.excerpt as string | null) ?? null,
    content_markdown: String(row.content_markdown ?? ""),
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    author_name: (row.author_name as string | null) ?? null,
    category_slug: (row.category_slug as string | null) ?? null,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    status: (row.status as "draft" | "published") ?? "draft",
    featured: Boolean(row.featured),
    published_at: (row.published_at as string | null) ?? null,
    updated_at: String(row.updated_at),
    created_at: String(row.created_at),
    reading_time_minutes: Number(row.reading_time_minutes ?? 1),
    post_stats: normalizeStats(row.post_stats),
  };
}

function toPostList(rows: Record<string, unknown>[] | null) {
  return (rows ?? []).map((row) => normalizePost(row));
}

function escapeForPostgrest(value: string) {
  return value.replace(/[,]/g, "\\,").replace(/[.]/g, "\\.");
}

function getNowIso() {
  return new Date().toISOString();
}

interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  tag?: string;
  category?: string;
}

export async function getPublishedPosts({
  page = 1,
  pageSize = POSTS_PER_PAGE,
  search,
  tag,
  category,
}: ListOptions): Promise<PostListResult> {
  const supabase = createPublicServerClient();
  const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const normalizedPageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : POSTS_PER_PAGE;

  let query = supabase
    .from("posts")
    .select(POST_SELECT, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", getNowIso())
    .order("published_at", { ascending: false });

  const cleanedSearch = search ? cleanSearchInput(search) : "";
  if (cleanedSearch) {
    const term = escapeForPostgrest(cleanedSearch);
    query = query.or(
      `title.ilike.%${term}%,excerpt.ilike.%${term}%,content_markdown.ilike.%${term}%`,
    );
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  if (category) {
    query = query.eq("category_slug", category);
  }

  const from = (normalizedPage - 1) * normalizedPageSize;
  const to = from + normalizedPageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / normalizedPageSize));

  return {
    posts: toPostList(data as Record<string, unknown>[] | null),
    totalCount,
    totalPages,
    page: normalizedPage,
    pageSize: normalizedPageSize,
  };
}

export const getTaxonomy = cache(async () => {
  const supabase = createPublicServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("category_slug,tags")
    .eq("status", "published")
    .lte("published_at", getNowIso());

  if (error) {
    throw new Error(`Failed to fetch taxonomy: ${error.message}`);
  }

  const categories = new Set<string>();
  const tags = new Set<string>();

  for (const row of data ?? []) {
    const categorySlug = row.category_slug;
    if (categorySlug) {
      categories.add(categorySlug);
    }

    for (const tagValue of row.tags ?? []) {
      if (tagValue) {
        tags.add(tagValue);
      }
    }
  }

  return {
    categories: [...categories].sort((a, b) => a.localeCompare(b)),
    tags: [...tags].sort((a, b) => a.localeCompare(b)),
  };
});

export async function getFeaturedPosts(limit = 4) {
  const supabase = createPublicServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .lte("published_at", getNowIso())
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch featured posts: ${error.message}`);
  }

  return toPostList(data as Record<string, unknown>[] | null);
}

export async function getLatestPosts(limit = POSTS_PER_PAGE) {
  const supabase = createPublicServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .lte("published_at", getNowIso())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch latest posts: ${error.message}`);
  }

  return toPostList(data as Record<string, unknown>[] | null);
}

export async function getPostBySlug(slug: string) {
  const supabase = createPublicServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", getNowIso())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch post: ${error.message}`);
  }

  return data ? normalizePost(data as Record<string, unknown>) : null;
}

export async function getRelatedPosts(post: Post, limit = RELATED_POST_LIMIT) {
  const supabase = createPublicServerClient();
  const rows: Post[] = [];

  if (post.category_slug) {
    const { data, error } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .lte("published_at", getNowIso())
      .eq("category_slug", post.category_slug)
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(limit * 2);

    if (error) {
      throw new Error(`Failed to fetch related posts by category: ${error.message}`);
    }

    rows.push(...toPostList(data as Record<string, unknown>[] | null));
  }

  if (rows.length < limit && post.tags.length > 0) {
    const { data, error } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .lte("published_at", getNowIso())
      .overlaps("tags", post.tags)
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(limit * 2);

    if (error) {
      throw new Error(`Failed to fetch related posts by tags: ${error.message}`);
    }

    rows.push(...toPostList(data as Record<string, unknown>[] | null));
  }

  const unique = new Map<string, Post>();
  for (const candidate of rows) {
    if (candidate.id === post.id || unique.has(candidate.id)) {
      continue;
    }
    unique.set(candidate.id, candidate);
    if (unique.size === limit) {
      break;
    }
  }

  return [...unique.values()];
}

export async function getPopularPosts(limit = SIDEBAR_POST_LIMIT, excludePostId?: string) {
  const supabase = createPublicServerClient();

  let query = supabase
    .from("post_stats")
    .select(
      "view_count,like_count,dislike_count,updated_at,post_id,posts!inner(id,title,slug,excerpt,content_markdown,cover_image_url,author_name,category_slug,tags,status,featured,published_at,updated_at,created_at,reading_time_minutes)",
    )
    .eq("posts.status", "published")
    .lte("posts.published_at", getNowIso())
    .order("view_count", { ascending: false })
    .limit(limit * 2);

  if (excludePostId) {
    query = query.neq("post_id", excludePostId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch popular posts: ${error.message}`);
  }

  const posts: Post[] = [];

  for (const row of data ?? []) {
    const postRow = Array.isArray(row.posts) ? row.posts[0] : row.posts;
    if (!postRow) {
      continue;
    }

    posts.push(
      normalizePost({
        ...postRow,
        post_stats: {
          post_id: row.post_id,
          view_count: row.view_count,
          like_count: row.like_count,
          dislike_count: row.dislike_count,
          updated_at: row.updated_at,
        },
      }),
    );

    if (posts.length === limit) {
      break;
    }
  }

  if (posts.length === 0) {
    return getLatestPosts(limit);
  }

  return posts;
}

export async function getAdjacentPosts(post: Post) {
  if (!post.published_at) {
    return {
      previousPost: null,
      nextPost: null,
    };
  }

  const supabase = createPublicServerClient();

  const [previousResult, nextResult] = await Promise.all([
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .lt("published_at", post.published_at)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .gt("published_at", post.published_at)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (previousResult.error) {
    throw new Error(`Failed to fetch previous post: ${previousResult.error.message}`);
  }

  if (nextResult.error) {
    throw new Error(`Failed to fetch next post: ${nextResult.error.message}`);
  }

  return {
    previousPost: previousResult.data
      ? normalizePost(previousResult.data as Record<string, unknown>)
      : null,
    nextPost: nextResult.data ? normalizePost(nextResult.data as Record<string, unknown>) : null,
  };
}

export async function getAllPublishedSlugs(limit = 5000) {
  const supabase = createPublicServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("slug,updated_at,published_at")
    .eq("status", "published")
    .lte("published_at", getNowIso())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch slugs: ${error.message}`);
  }

  return data ?? [];
}
