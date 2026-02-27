export type ImpressionType = "like" | "dislike";

export interface PostStats {
  post_id: string;
  view_count: number;
  like_count: number;
  dislike_count: number;
  updated_at?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_markdown: string;
  cover_image_url: string | null;
  author_name: string | null;
  category_slug: string | null;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  reading_time_minutes: number;
  post_stats: PostStats | null;
}

export interface PostListResult {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface TocHeading {
  id: string;
  depth: number;
  text: string;
}
