import Link from "next/link";

import type { TocHeading } from "@/types/blog";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/80">
      <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        On this page
      </h3>
      <ul className="mt-3 space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.depth >= 3 ? "ml-3" : "ml-0"}>
            <Link
              href={`#${heading.id}`}
              className="text-sm text-slate-600 hover:text-sky-700 dark:text-slate-300 dark:hover:text-sky-300"
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
