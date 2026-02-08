import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Search, HeartCrack } from "lucide-react";
import Navbar from "../components/navbar";

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const q = params.get("q") || "";
  const type = params.get("type") || "Books";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search Bar State
  const categories = ["Books", "Papers", "PDFs", "Notes", "Journals"];
  const suggestions = [
    "Atomic Habits",
    "Machine Learning",
    "Physics Notes",
    "DSA Sheet",
    "Business",
    "AI Research",
  ];

  const [activeCategory, setActiveCategory] = useState(type);
  const [query, setQuery] = useState(q);

  // ✅ Redirect Search (same as SearchHero)
  const handleSearch = (text = query) => {
     ReactGA.event({
    category: "Search",
    action: activeCategory,
    label: query,
  });
    if (!text.trim()) return;

    const encoded = encodeURIComponent(text);
    navigate(`/search?type=${activeCategory}&q=${encoded}`);
  };

  // ✅ Smart Search Engine
  const runSearch = async () => {
    if (!q.trim()) return;

    setLoading(true);
    const keyword = `%${q}%`;

    let results = [];

    // 1️⃣ Search inside category first
    if (type && type !== "All") {
      const { data, error } = await supabase
        .from("books")
        .select("id,title,category,img_url")
        .eq("category", type)
        .ilike("title", keyword)
        .limit(30);

      if (!error) results = data;
    }

    // 2️⃣ If nothing → Global search fallback
    if (results.length === 0) {
      const { data, error } = await supabase
        .from("books")
        .select("id,title,category,img_url")
        .or(`title.ilike.${keyword},category.ilike.${keyword}`)
        .limit(30);

      if (error) console.log("Search Error:", error);
      results = data || [];
    }

    setBooks(results);
    setLoading(false);
  };

  // ✅ Run search whenever URL changes
  useEffect(() => {
    setQuery(q);
    setActiveCategory(type);
    runSearch();
  }, [q, type]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white px-4 py-10 pt-24 font-display">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* ✅ Search Bar Section */}
          <div className="space-y-6">

            {/* Tabs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveCategory(item)}
                  className={`shrink-0 px-4 py-1.5 rounded-full border text-sm transition
                    ${
                      activeCategory === item
                        ? "bg-black text-white border-black"
                        : "text-gray-500 border-gray-300 hover:text-black"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3 bg-gray-100 border rounded-2xl px-5 py-3">
              <Search className="text-gray-400" size={20} />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearch()
                }
                placeholder={`Search ${activeCategory.toLowerCase()}...`}
                className="w-full bg-transparent outline-none text-sm"
              />

              <button
                onClick={() => handleSearch()}
                className="bg-black text-white px-5 py-2 rounded-xl text-sm hover:opacity-90 transition"
              >
                Search
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSearch(tag)}
                  className="shrink-0 text-xs px-3 py-1 rounded-full bg-gray-100 border text-gray-600 hover:text-black transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Search Results
            </h1>

            <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
              <Search size={16} />
              Showing results for{" "}
              <span className="font-medium text-black">“{q}”</span>
              {type && <span className="text-gray-400">in {type}</span>}
            </p>
          </div>

          {/* ✅ Loading */}
          {loading && (
            <p className="text-gray-500 text-sm">
              Searching books...
            </p>
          )}

          {/* ✅ No Results */}
          {!loading && books.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-800 flex gap-2 justify-center">
                <HeartCrack />
                No PDFs found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try searching another keyword...
              </p>
            </div>
          )}

          {/* ✅ Results */}
          {!loading && books.length > 0 && (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {books.map((book) => (
                <Link
                  key={book.id}
                  to={`/pdf/${book.id}`}
                  className="group rounded-2xl overflow-hidden border bg-white hover:shadow-md transition"
                >
                  <div className="aspect-3/4 bg-gray-100 overflow-hidden">
                    <img
                      src={book.img_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {book.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center font-display text-sm p-2 bg-gray-900 text-white/80">
        &copy; PDF Lovers 2026. All Rights Reserved.
      </div>
    </>
  );
}
