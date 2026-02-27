import Link from "next/link";

import type { Post } from "@/types/blog";

interface PostLinksListProps {
  title: string;
  posts: Post[];
}

export function PostLinksList({ title, posts }: PostLinksListProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/80">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        {title}
      </h3>
      <ul className="mt-3 space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-sm font-medium text-slate-700 hover:text-sky-700 dark:text-slate-200 dark:hover:text-sky-300"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
