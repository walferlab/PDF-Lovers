import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pathname: string;
  query?: Record<string, string | undefined>;
}

function buildLink(pathname: string, page: number, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const serialized = params.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function Pagination({ currentPage, totalPages, pathname, query = {} }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return (
    <nav className="mt-8 flex flex-wrap items-center gap-2" aria-label="Pagination">
      <Link
        href={buildLink(pathname, Math.max(1, currentPage - 1), query)}
        className="rounded-full border border-black/10 px-3 py-1 text-sm text-slate-700 transition hover:border-sky-500 hover:text-sky-700 dark:border-white/10 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300"
      >
        Previous
      </Link>

      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={buildLink(pathname, pageNumber, query)}
          className={`rounded-full px-3 py-1 text-sm ${
            pageNumber === currentPage
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "border border-black/10 text-slate-700 hover:border-sky-500 hover:text-sky-700 dark:border-white/10 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300"
          }`}
        >
          {pageNumber}
        </Link>
      ))}

      <Link
        href={buildLink(pathname, Math.min(totalPages, currentPage + 1), query)}
        className="rounded-full border border-black/10 px-3 py-1 text-sm text-slate-700 transition hover:border-sky-500 hover:text-sky-700 dark:border-white/10 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300"
      >
        Next
      </Link>
    </nav>
  );
}
