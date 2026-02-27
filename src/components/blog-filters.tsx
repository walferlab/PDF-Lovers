import { toTitleCase } from "@/lib/utils";

interface BlogFiltersProps {
  categories: string[];
  tags: string[];
  selectedCategory?: string;
  selectedTag?: string;
  search?: string;
  action?: string;
}

export function BlogFilters({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  search,
  action = "/blog",
}: BlogFiltersProps) {
  return (
    <form
      action={action}
      className="grid gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 shadow-sm sm:grid-cols-4 dark:border-white/10 dark:bg-slate-900/80"
    >
      <input
        type="search"
        name="q"
        defaultValue={search}
        placeholder="Search title, excerpt, content"
        className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-white/10 dark:bg-slate-950"
      />

      <select
        name="category"
        defaultValue={selectedCategory || ""}
        className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-white/10 dark:bg-slate-950"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {toTitleCase(category)}
          </option>
        ))}
      </select>

      <select
        name="tag"
        defaultValue={selectedTag || ""}
        className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-sky-500 transition focus:ring-2 dark:border-white/10 dark:bg-slate-950"
      >
        <option value="">All tags</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            #{tag}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          Apply
        </button>
        <a
          href={action}
          className="rounded-xl border border-black/10 px-4 py-2 text-sm text-slate-700 transition hover:border-sky-500 hover:text-sky-700 dark:border-white/10 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300"
        >
          Reset
        </a>
      </div>
    </form>
  );
}
