import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import BookCard from "../components/bookCard";
import Seo from "../components/seo";
import { supabase } from "../lib/supabaseClient";
import { toAbsoluteUrl } from "../lib/seo";
import { getPrimaryCategory, matchCategory, toCategoryArray } from "../lib/category";

const normalizeCategory = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function CategoryPage() {
  const { slug } = useParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const categoryName = useMemo(() => {
    return decodeURIComponent(slug || "")
      .trim()
      .replace(/-+/g, " ");
  }, [slug]);

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      if (!categoryName) {
        setBooks([]);
        setFetchError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError("");
      const normalizedCategoryName = normalizeCategory(categoryName);

      const { data: exactData, error: exactError } = await supabase
        .from("books")
        .select("*")
        .contains("category", [categoryName])
        .order("views", { ascending: false });

      if (exactError) {
        // Continue with fallback to keep the page usable if exact array match fails.
      }

      if (!exactError && (exactData || []).length > 0) {
        setBooks(exactData || []);
        setLoading(false);
        return;
      }

      const { data: looseData, error: looseError } = await supabase
        .from("books")
        .select("*")
        .not("category", "is", null)
        .order("views", { ascending: false });

      if (looseError) {
        setBooks([]);
        setFetchError("Unable to load this category right now.");
      } else {
        const filtered = (looseData || []).filter((book) =>
          toCategoryArray(book?.category).some((cat) => {
            const normalized = normalizeCategory(cat);
            return (
              normalized === normalizedCategoryName ||
              normalized.includes(normalizedCategoryName)
            );
          })
        );
        setBooks(filtered);
      }

      setLoading(false);
    };

    fetchCategoryBooks();
  }, [categoryName]);

  const displayCategory = useMemo(() => {
    const matched = matchCategory(books[0]?.category, categoryName);
    if (matched) return matched;
    const primary = getPrimaryCategory(books[0]?.category);
    if (primary) return primary;
    return categoryName
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [books, categoryName]);

  const structuredData = useMemo(() => {
    const items = books.slice(0, 20).map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: book.title,
      url: toAbsoluteUrl(`/pdf/${book.id}`),
    }));

    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${displayCategory || "Category"} PDFs - PDF Lovers`,
        url: toAbsoluteUrl(`/category/${slug || ""}`),
        description: `Browse ${displayCategory || "category"} PDFs sorted by views.`,
      },
      items.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${displayCategory || "Category"} PDF List`,
            itemListElement: items,
          }
        : null,
    ].filter(Boolean);
  }, [books, displayCategory, slug]);

  const robotsRule = !loading && books.length === 0 ? "noindex, follow" : undefined;

  if (loading) {
    return (
      <>
        <Seo
          title="Loading Category - PDF Lovers"
          description="Loading category books and PDFs."
          pathname={`/category/${slug || ""}`}
          robots="noindex, follow"
        />
        <Navbar />
        <div className="min-h-screen pt-32 flex items-center justify-center text-md text-gray-600">
          <p className="font-display font-bold text-md">Loading category...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${displayCategory || "Category"} - PDF Lovers`}
        description={`Explore ${books.length} ${displayCategory || "category"} PDFs sorted by highest views.`}
        pathname={`/category/${slug || ""}`}
        keywords={`${displayCategory || "category"} pdf, free ${displayCategory || "category"} books`}
        robots={robotsRule}
        structuredData={structuredData}
      />

      <Navbar />

      <main className="w-full min-h-screen bg-white pt-28 sm:pt-32">
        <div className="max-w-6xl mx-auto px-4 pb-8 pt-5 sm:pb-10 sm:pt-6">
          <h1 className="text-center font-display text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-snug">
            {displayCategory || "Category"}
          </h1>

          <p className="mt-3 text-center text-sm text-gray-500 font-display">
            {books.length} PDFs found | Sorted by views (highest first)
          </p>

          {fetchError && (
            <p className="mt-8 text-sm text-red-500 font-display">{fetchError}</p>
          )}

          {!fetchError && books.length === 0 && (
            <div className="mt-10 min-h-50 flex items-center justify-center text-md text-gray-600">
              <p className="font-display font-bold text-md">
                No books found in this category.
              </p>
            </div>
          )}

          {!fetchError && books.length > 0 && (
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
