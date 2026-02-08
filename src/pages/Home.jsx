import Navbar from "../components/navbar";
import SearchBox from "../components/search";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import BookGrid from "../components/bookGrid";
import Pagination from "../components/pagination";

const BOOKS_PER_PAGE = 20;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(totalBooks / BOOKS_PER_PAGE);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      const from = (page - 1) * BOOKS_PER_PAGE;
      const to = from + BOOKS_PER_PAGE - 1;

      const { data, count, error } = await supabase
        .from("books")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error) {
        setBooks(data);
        setTotalBooks(count);
      }

      setLoading(false);
    };

    fetchBooks();
  }, [page]);

  return (
    <>
    <Navbar />
    <div className="py-5 max-w-6xl mx-auto min-h-screen w-full flex flex-col items-center space-y-15 pt-24 px-4 bg-white">
        <SearchBox />
      <p className="font-display text-2xl sm:text-4xl text-black/90 font-black text-center">Latest Pdf's</p>

      <BookGrid books={books} loading={loading} />

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={(p) => setSearchParams({ page: p })}
      />
    </div>
      <div className="w-full text-center font-display text-sm p-2 bg-gray-900 text-white/80">
        &copy; PDF Lovers 2026. All Rights Reserved.
      </div>
    </>
  );
}
