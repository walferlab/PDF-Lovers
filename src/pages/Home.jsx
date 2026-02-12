import Navbar from "../components/navbar";
import SearchBox from "../components/search";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import BookGrid from "../components/bookGrid";
import Pagination from "../components/pagination";
import Footer from "../components/footer";
import Seo from "../components/seo";
import { toAbsoluteUrl } from "../lib/seo";

const BOOKS_PER_PAGE = 20;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = searchParams.get("page");
  const parsedPage = Number.parseInt(rawPage || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);
  const structuredData = useMemo(() => {
    const items = books.slice(0, 10).map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: toAbsoluteUrl(`/pdf/${book.id}`),
      name: book.title,
    }));

    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Home - PDF Lovers",
        url: toAbsoluteUrl("/"),
        description:
          "Browse the latest free PDF books, notes, journals, and study resources.",
      },
      items.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Latest PDFs",
            itemListElement: items,
          }
        : null,
    ].filter(Boolean);
  }, [books]);

  useEffect(() => {
    if (rawPage && page === 1 && rawPage !== "1") {
      setSearchParams({ page: "1" }, { replace: true });
    }
  }, [rawPage, page, setSearchParams]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setErrorMessage("");

      const from = (page - 1) * BOOKS_PER_PAGE;
      const to = from + BOOKS_PER_PAGE - 1;

      const { data, count, error } = await supabase
        .from("books")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        setBooks([]);
        setTotalBooks(0);
        setErrorMessage("Unable to load books right now.");
        setLoading(false);
        return;
      }

      const safeCount = Number(count || 0);
      const safeTotalPages = Math.max(1, Math.ceil(safeCount / BOOKS_PER_PAGE));

      // If page is out of range (e.g. old URL), snap to the last valid page.
      if (safeCount > 0 && page > safeTotalPages) {
        setSearchParams({ page: String(safeTotalPages) }, { replace: true });
        setLoading(false);
        return;
      }

      setBooks(data || []);
      setTotalBooks(safeCount);
      setLoading(false);
    };

    fetchBooks();
  }, [page, setSearchParams]);

  return (
    <>
      <Seo
        title="Home - PDF Lovers"
        description="Download free PDF books, academic notes, journals, and study resources from the latest uploads."
        pathname="/"
        keywords="free pdf books, latest pdf books, notes pdf, journals pdf, study resources"
        structuredData={structuredData}
      />
      <Navbar />
      <div className="py-5 max-w-6xl mx-auto min-h-screen w-full flex flex-col items-center space-y-15 pt-24 px-4 bg-white">
        <SearchBox />
        <h2 className="font-display text-2xl sm:text-4xl text-black/90 font-black text-center">
          Latest PDFs
        </h2>

        {errorMessage && (
          <p className="text-sm font-display text-red-500">{errorMessage}</p>
        )}

        <BookGrid books={books} loading={loading} />

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => setSearchParams({ page: String(p) })}
        />
      </div>
      <Footer />
    </>
  );
}
