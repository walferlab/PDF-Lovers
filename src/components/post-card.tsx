import Link from "next/link";

import { formatDate, toTitleCase } from "@/lib/utils";
import type { Post } from "@/types/blog";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-black/10 bg-white/80 p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/80 dark:hover:border-sky-700">
      {post.category_slug ? (
        <Link
          href={`/category/${post.category_slug}`}
          className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-sky-800 dark:bg-sky-900/50 dark:text-sky-200"
        >
          {toTitleCase(post.category_slug)}
        </Link>
      ) : null}

      <h2 className="mt-3 font-heading text-xl font-bold leading-tight text-slate-900 dark:text-slate-100">
        <Link href={`/blog/${post.slug}`} className="hover:text-sky-700 dark:hover:text-sky-300">
          {post.title}
        </Link>
      </h2>

      {post.excerpt ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>{formatDate(post.published_at)}</span>
        <span>{post.reading_time_minutes} min read</span>
        <span>{post.post_stats?.view_count ?? 0} views</span>
      </div>

      {post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="rounded-full border border-black/10 px-2 py-1 text-xs text-slate-600 transition hover:border-sky-500 hover:text-sky-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
