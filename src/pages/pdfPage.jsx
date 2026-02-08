import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Download } from "lucide-react";
import Navbar from "../components/navbar";
import BookCard from "../components/bookCard";

export default function PdfPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Book + Related
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);

      // Main Book
      const { data: mainBook, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setBook(mainBook);

      // Related Books
      const { data: related } = await supabase
        .from("books")
        .select("*")
        .neq("id", id)
        .eq("category", mainBook.category)
        .limit(10);

      setRelatedBooks(related || []);
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center text-md text-gray-600">
        <p className="font-display font-bold text-md">Loading book...</p>
      </div>
      </>
    );
  }

  // Not Found
  if (!book) {
    return (
      <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center flex-col text-md text-gray-600">
        <p className="font-display font-bold text-lg">Book not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="
            text-sm text-gray-500
            hover:text-black transition font-display
            underline
            "
        >
          Back to Library
        </button>
      </div>
      </>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-white pt-15">
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="
            inline-flex items-center gap-2
            text-sm text-gray-500
            hover:text-black transition font-display
          "
        >
          <ArrowLeft size={16} />
          Back to Library
        </button>
      </div>

      {/* Main Book Section */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10 md:gap-14">
          {/* Cover */}
          <div className="w-full md:w-[320px]">
            <div
              className="
                aspect-3/4
                rounded-3xl
                bg-gray-100
                overflow-hidden
                shadow-sm
              "
            >
              <img
                src={book.img_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            {/* Category */}
            <span
              className="
                inline-flex items-center
                px-3 py-1
                text-xs font-medium
                rounded-full
                bg-gray-100 text-gray-700
                border border-gray-200
              "
            >
              {book.category}
            </span>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-snug">
              {book.title}
            </h1>

            {/* Meta */}
            <p className="text-sm text-gray-500 font-display">
              Free resource • Uploaded{" "}
              {new Date(book.created_at).toLocaleDateString()}
            </p>

            {/* Download Button */}
            {book.pdf_link && (
  <a
    href={book.pdf_link}
    target="_blank"
    rel="noreferrer"
    className="font-display
      inline-flex items-center gap-3
      px-6 py-3
      rounded-xl
      bg-black text-white
      hover:bg-gray-800
      transition
      shadow-sm
    "
  >
    {/* Icon */}
    <Download size={20} />

    {/* Text */}
    <div className="flex flex-col leading-tight">
      <span className="text-sm font-medium">
        Download
      </span>

      <span className="text-xs text-white/60">
        PDF Format • Free
      </span>
    </div>
  </a>
)}


            {/* Tags */}
            {book.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {book.tags.slice(0, 6).map((tag, i) => (
                  <span
                    key={i}
                    className="
                      text-xs px-3 py-1
                      rounded-full
                      bg-white
                      border border-gray-200
                      text-gray-600
                      hover:border-gray-400 hover:text-black
                      transition
                    "
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Shelf */}
        {relatedBooks.length > 0 && (
          <div className="mt-20">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Related in {book.category}
              </h2>

              <p className="text-sm text-gray-500">
                More like this →
              </p>
            </div>

            {/* Scroll Shelf */}
            <div className="flex gap-5 overflow-x-auto pb-3 no-scrollbar">
              {relatedBooks.map((b) => (
                <div key={b.id} className="shrink-0">
                  <BookCard book={b} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    <div className="w-full text-center font-display text-sm p-2 bg-gray-900 text-white/80">
        &copy; PDF Lovers 2026. All Rights Reserved.
      </div>
    </>
  );
}
