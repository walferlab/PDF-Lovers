import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import ReactGA from "react-ga4";
import { supabase } from "../lib/supabaseClient";
import { Search, HeartCrack } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Seo from "../components/seo";

const SUGGESTIONS = [
  "Atomic Habits",
  "Machine Learning",
  "Physics Notes",
  "DSA Sheet",
  "Business",
  "AI Research",
];
const MAX_QUERY_LENGTH = 120;
const MIN_QUERY_LENGTH = 2;

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toTokens = (value) => normalize(value).split(" ").filter(Boolean);
const toWords = (value) => normalize(value).split(" ").filter(Boolean);

const toTagArray = (tags) => {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag));
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  if (tags && typeof tags === "object") return Object.values(tags).map(String);
  return [];
};

const boundedLevenshtein = (a, b, maxDistance = 2) => {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    let minInRow = curr[0];

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
      if (curr[j] < minInRow) minInRow = curr[j];
    }

    if (minInRow > maxDistance) return maxDistance + 1;

    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }

  return prev[b.length];
};

const fuzzyWordBonus = (token, words) => {
  if (!token || words.length === 0 || token.length < 3) return 0;

  let best = 0;
  for (const word of words) {
    if (!word || Math.abs(word.length - token.length) > 2) continue;
    const distance = boundedLevenshtein(token, word, 2);
    if (distance === 1) best = Math.max(best, 16);
    if (distance === 2) best = Math.max(best, 8);
  }
  return best;
};

const getBookScore = (book, normalizedQuery, tokens, activeType) => {
  const title = normalize(book?.title);
  const category = normalize(book?.category);
  const tags = toTagArray(book?.tags).map(normalize);
  const tagsText = tags.join(" ");
  const titleWords = toWords(title);
  const categoryWords = toWords(category);
  const tagWords = toWords(tagsText);
  const type = normalize(activeType);
  let score = 0;

  if (!title && !category && !tagsText) return 0;

  if (title === normalizedQuery) score += 220;
  if (title.startsWith(normalizedQuery)) score += 140;
  if (title.includes(normalizedQuery)) score += 90;

  if (category === normalizedQuery) score += 130;
  if (category.includes(normalizedQuery)) score += 60;

  if (tags.includes(normalizedQuery)) score += 160;
  if (tagsText.includes(normalizedQuery)) score += 70;

  tokens.forEach((token) => {
    if (title.includes(token)) score += 26;
    if (category.includes(token)) score += 20;
    if (tagsText.includes(token)) score += 24;

    score += fuzzyWordBonus(token, titleWords);
    score += fuzzyWordBonus(token, categoryWords);
    score += fuzzyWordBonus(token, tagWords);
  });

  if (type && type !== "all") {
    if (category === type) score += 36;
    else if (category.includes(type)) score += 18;
  }

  score += Math.min(20, Math.log10((book?.views || 0) + 1) * 8);
  return score;
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const q = String(params.get("q") || "").slice(0, MAX_QUERY_LENGTH);
  const currentType = "All";

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  const normalizedQuery = useMemo(() => normalize(q), [q]);
  const tokens = useMemo(() => toTokens(q), [q]);

  const handleSearch = (text = "") => {
    const finalQuery = text.trim().slice(0, MAX_QUERY_LENGTH);
    if (!finalQuery) return;

    ReactGA.event({
      category: "Search",
      action: "All",
      label: finalQuery,
    });

    const encoded = encodeURIComponent(finalQuery);
    navigate(`/search?q=${encoded}`);
  };

  const runSearch = useCallback(async () => {
    if (!normalizedQuery || normalizedQuery.length < MIN_QUERY_LENGTH) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let queryBuilder = supabase
      .from("books")
      .select("id,title,category,img_url,tags,views,created_at")
      .order("views", { ascending: false })
      .limit(800);

    const { data, error } = await queryBuilder;

    if (error) {
      setBooks([]);
      setLoading(false);
      return;
    }

    let scored = (data || [])
      .map((book) => ({
        book,
        score: getBookScore(book, normalizedQuery, tokens, currentType),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.book?.views || 0) - (a.book?.views || 0);
      })
      .map((item) => item.book)
      .slice(0, 60);

    setBooks(scored);
    setLoading(false);
  }, [currentType, normalizedQuery, tokens]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch();
    }, 0);

    return () => clearTimeout(timer);
  }, [runSearch]);

  const seoTitle = q.trim()
    ? `Search Results for "${q}" - PDF Lovers`
    : "Search PDFs - PDF Lovers";

  const seoDescription = q.trim()
    ? `Search results for "${q}" across PDF titles, categories, and tags.`
    : "Search PDF books by title, category, and tags.";

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        pathname="/search"
        robots="noindex, follow"
      />
      <Navbar />

      <div className="min-h-screen bg-white px-4 py-10 pt-24 font-display">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-gray-100 border rounded-2xl p-3">
              <Search className="text-gray-400" size={20} />

              <input
                ref={inputRef}
                key={q}
                defaultValue={q}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(e.currentTarget.value)}
                placeholder="Search by title, category, or tags..."
                className="w-full bg-transparent outline-none text-sm"
              />

              <button
                onClick={() => handleSearch(inputRef.current?.value || "")}
                className="bg-black text-white p-2 rounded-xl text-sm hover:opacity-90 transition"
              >
                <Search strokeWidth={3} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {SUGGESTIONS.map((tag) => (
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

          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Search Results
            </h1>

            <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
              <Search size={16} />
              Showing results for <span className="font-medium text-black">"{q}"</span>
            </p>
          </div>

          {loading && <p className="text-gray-500 text-sm">Searching books...</p>}

          {!loading && books.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-800 flex gap-2 justify-center">
                <HeartCrack />
                No PDFs found
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try searching by another title, category, or tag...
              </p>
            </div>
          )}

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
                    <p className="text-xs text-gray-500 mt-1">{book.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
