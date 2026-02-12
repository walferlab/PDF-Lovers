import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import Navbar from "../components/navbar";
import BookCard from "../components/bookCard";
import Footer from "../components/footer";
import Seo from "../components/seo";
import { supabase } from "../lib/supabaseClient";
import { toAbsoluteUrl } from "../lib/seo";

const MAX_CATEGORY_SECTIONS = 12;

function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function ShowCategory({ catName }) {
  const navigate = useNavigate();
  const slug = toSlug(catName);
  const [catBooks, setCatBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("category", catName)
        .order("views", { ascending: false })
        .limit(10);

      if (error) {
        setCatBooks([]);
      } else {
        setCatBooks(data || []);
      }

      setLoading(false);
    };

    fetchCategoryBooks();
  }, [catName]);

  return (
    <section className="py-2 sm:py-3">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <h2 className="text-base font-display font-black text-black/80 sm:text-xl">
          {catName}
        </h2>

        <button
          type="button"
          className="text-xs font-display font-medium text-black/55 sm:text-sm cursor-pointer"
          onClick={() => navigate(`/category/${slug}`)}
        >
          More like this -&gt;
        </button>
      </div>

      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 no-scrollbar sm:gap-5">
        {loading && (
          <p className="py-2 text-sm font-display text-black/60">Loading PDFs...</p>
        )}

        {!loading &&
          catBooks.map((book) => (
            <div key={book.id} className="shrink-0 snap-start">
              <BookCard book={book} />
            </div>
          ))}
      </div>
    </section>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);

      const { data, error } = await supabase
        .from("books")
        .select("category,views")
        .not("category", "is", null)
        .limit(2500);

      if (error) {
        setCategories([]);
        setLoadingCategories(false);
        return;
      }

      const byCategory = new Map();

      for (const row of data || []) {
        const name = String(row?.category || "").trim();
        if (!name) continue;

        const key = name.toLowerCase();
        const views = Number(row?.views || 0);
        const current = byCategory.get(key) || {
          name,
          count: 0,
          maxViews: 0,
          totalViews: 0,
        };

        current.count += 1;
        current.totalViews += views;
        if (views > current.maxViews) {
          current.maxViews = views;
          current.name = name;
        }

        byCategory.set(key, current);
      }

      const ranked = [...byCategory.values()]
        .sort((a, b) => {
          if (b.maxViews !== a.maxViews) return b.maxViews - a.maxViews;
          if (b.totalViews !== a.totalViews) return b.totalViews - a.totalViews;
          return b.count - a.count;
        })
        .slice(0, MAX_CATEGORY_SECTIONS)
        .map((item) => item.name);

      setCategories(ranked);
      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  const structuredData = useMemo(() => {
    const itemListElement = categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category,
      url: toAbsoluteUrl(`/category/${toSlug(category)}`),
    }));

    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "PDF Categories - PDF Lovers",
        url: toAbsoluteUrl("/categories"),
        description: "Browse top categories of PDF books, notes, and journals.",
      },
      itemListElement.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Top Categories",
            itemListElement,
          }
        : null,
    ].filter(Boolean);
  }, [categories]);

  return (
    <>
      <Seo
        title="Categories - PDF Lovers"
        description="Explore top PDF categories and discover the most viewed books in each category."
        pathname="/categories"
        keywords="pdf categories, free books by category, popular categories"
        structuredData={structuredData}
      />

      <Navbar />

      <main className="w-full bg-[#fafafa] pt-18 sm:pt-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-3 pb-8 pt-4 sm:gap-6 sm:px-4 sm:pb-10 sm:pt-6 md:gap-7 md:px-6 md:pb-12">
          <header className="px-1 py-2 sm:px-0 sm:py-3">
            <div className="flex items-center justify-center gap-2">
              <LayoutGrid className="h-6 w-6 text-black/70" />
              <h1 className="text-center font-display text-2xl font-black text-black/85 sm:text-3xl">
                Categories
              </h1>
            </div>

            <p className="mt-1 text-center text-xs font-display text-black/55 sm:text-sm">
              Explore the most viewed PDF books in each category
            </p>
          </header>

          {loadingCategories && (
            <p className="text-sm font-display text-center text-black/60">
              Loading categories...
            </p>
          )}

          {!loadingCategories &&
            categories.map((name) => <ShowCategory key={name} catName={name} />)}

          {!loadingCategories && categories.length === 0 && (
            <p className="text-sm font-display text-center text-black/60">
              No categories found.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
