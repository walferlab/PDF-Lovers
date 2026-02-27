import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white/80 py-10 dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm text-slate-600 sm:px-6 lg:px-8 dark:text-slate-300">
        <p>Movie World Blog. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/blog" className="hover:text-slate-900 dark:hover:text-white">
            Browse all posts
          </Link>
          <Link href="/search" className="hover:text-slate-900 dark:hover:text-white">
            Search
          </Link>
          <Link href="/rss.xml" className="hover:text-slate-900 dark:hover:text-white">
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
