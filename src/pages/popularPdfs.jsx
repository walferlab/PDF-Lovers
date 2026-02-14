import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Medal, TrendingUp } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import BookCard from "../components/bookCard";
import { supabase } from "../lib/supabaseClient";
import Seo from "../components/seo";
import { toAbsoluteUrl } from "../lib/seo";

const MAX_RESULTS = 24;

export default function PopularPdfs() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const structuredData = useMemo(() => {
    const list = books.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: book.title,
      url: toAbsoluteUrl(`/pdf/${book.id}`),
    }));

    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Popular PDFs - PDF Lovers",
        url: toAbsoluteUrl("/popular-pdfs"),
        description: "Most viewed and downloaded PDFs of all time.",
      },
      list.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Popular PDF List",
            itemListElement: list,
          }
        : null,
    ].filter(Boolean);
  }, [books]);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("books")
        .select("id,title,category,img_url,views,downloads")
        .order("views", { ascending: false })
        .order("downloads", { ascending: false })
        .limit(MAX_RESULTS);

      if (error) {
        setBooks([]);
      } else {
        setBooks(data || []);
      }

      setLoading(false);
    };

    fetchPopular();
  }, []);

  return (
    <>
      <Seo
        title="Popular PDFs - PDF Lovers"
        description="Discover the most viewed and downloaded free PDFs of all time."
        pathname="/popular-pdfs"
        keywords="popular pdfs, top downloaded pdf books, most viewed pdf"
        structuredData={structuredData}
      />
      <Navbar />
      <main className="min-h-screen bg-[#fafafa] pt-28 sm:pt-32">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
          <section className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Medal className="h-7 w-7 text-amber-500" />
              <h1 className="font-display text-3xl font-black text-black/85">
                Popular PDFs
              </h1>
            </div>
            <p className="mt-2 text-sm font-display text-black/60">
              Discover the most loved PDFs by our community.
            </p>
            {!loading && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-display font-medium text-black/65">
                <TrendingUp className="h-3.5 w-3.5" />
                {books.length} results
              </p>
            )}
          </section>

          {loading && (
            <div className="mt-12 flex items-center justify-center gap-2 text-gray-500">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <p className="font-display text-sm">Loading popular PDFs...</p>
            </div>
          )}

          {!loading && books.length === 0 && (
            <div className="mt-10 rounded-2xl border border-black/10 bg-white p-6 text-center">
              <p className="text-sm font-display text-black/60">
                No popular PDFs found.
              </p>
            </div>
          )}

          {!loading && books.length > 0 && (
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
