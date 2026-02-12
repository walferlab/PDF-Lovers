import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, LoaderCircle, Share2 } from "lucide-react";
import Navbar from "../components/navbar";
import BookCard from "../components/bookCard";
import Footer from "../components/footer";
import Seo from "../components/seo";
import { supabase } from "../lib/supabaseClient";
import { toAbsoluteUrl } from "../lib/seo";

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:"]);

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value) => normalizeText(value).split(" ").filter(Boolean);

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

const getRelatedScore = (mainBook, candidate) => {
  const mainCategory = normalizeText(mainBook?.category);
  const candidateCategory = normalizeText(candidate?.category);

  const mainTags = new Set(toTagArray(mainBook?.tags).map(normalizeText));
  const candidateTags = new Set(toTagArray(candidate?.tags).map(normalizeText));

  const mainTitleTokens = new Set(tokenize(mainBook?.title).filter((t) => t.length > 2));
  const candidateTitleTokens = new Set(
    tokenize(candidate?.title).filter((t) => t.length > 2)
  );

  let score = 0;

  if (mainCategory && candidateCategory) {
    if (mainCategory === candidateCategory) score += 160;
    else if (
      mainCategory.includes(candidateCategory) ||
      candidateCategory.includes(mainCategory)
    ) {
      score += 90;
    }
  }

  let commonTagCount = 0;
  for (const tag of mainTags) {
    if (candidateTags.has(tag)) commonTagCount += 1;
  }
  score += commonTagCount * 55;

  let commonTitleTokenCount = 0;
  for (const token of mainTitleTokens) {
    if (candidateTitleTokens.has(token)) commonTitleTokenCount += 1;
  }
  score += commonTitleTokenCount * 28;

  score += Math.min(20, Math.log10((candidate?.views || 0) + 1) * 8);

  return score;
};

const toSafeHttpUrl = (rawUrl) => {
  try {
    const parsed = new URL(String(rawUrl || "").trim());
    if (!SAFE_URL_PROTOCOLS.has(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
};

const getGoogleDriveFileId = (safeUrl) => {
  try {
    const parsed = new URL(safeUrl);
    if (!parsed.hostname.includes("drive.google.com")) return "";

    const byPath = parsed.pathname.match(/\/file\/d\/([^/]+)/i)?.[1];
    if (byPath) return byPath;

    const byQuery = parsed.searchParams.get("id");
    if (byQuery) return byQuery;
  } catch {
    return "";
  }

  return "";
};

const getSecureDownloadUrl = (rawUrl) => {
  const safeUrl = toSafeHttpUrl(rawUrl);
  if (!safeUrl) return "";

  const driveFileId = getGoogleDriveFileId(safeUrl);
  if (driveFileId) {
    return `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
      driveFileId
    )}&export=download&confirm=t`;
  }

  return safeUrl;
};

const sanitizeFilename = (value) => {
  const cleaned = String(value || "")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "pdf-lovers-download";
};

export default function PdfPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackedViewIds = useRef(new Set());

  const incrementBookMetric = async (bookId, metric) => {
    if (!bookId || !metric) return;

    const { data: currentRow, error: fetchError } = await supabase
      .from("books")
      .select(metric)
      .eq("id", bookId)
      .single();

    if (fetchError) return;

    const currentValue = Number(currentRow?.[metric] || 0);

    await supabase
      .from("books")
      .update({ [metric]: currentValue + 1 })
      .eq("id", bookId);
  };

  const handleDownloadClick = (event) => {
    event?.preventDefault?.();
    if (!book?.id || !book?.pdf_link) return;

    const downloadUrl = getSecureDownloadUrl(book.pdf_link);
    if (!downloadUrl) return;

    incrementBookMetric(book.id, "downloads");

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${sanitizeFilename(book.title)}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.referrerPolicy = "no-referrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);

      const { data: mainBook, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setBook(null);
        setRelatedBooks([]);
        setLoading(false);
        return;
      }

      setBook(mainBook);

      if (!trackedViewIds.current.has(String(mainBook.id))) {
        trackedViewIds.current.add(String(mainBook.id));
        incrementBookMetric(mainBook.id, "views");
      }

      const { data: candidates } = await supabase
        .from("books")
        .select("*")
        .neq("id", id)
        .order("views", { ascending: false })
        .limit(500);

      const rankedRelated = (candidates || [])
        .map((candidate) => ({
          book: candidate,
          score: getRelatedScore(mainBook, candidate),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (b.book?.views || 0) - (a.book?.views || 0);
        })
        .map((item) => item.book)
        .slice(0, 10);

      setRelatedBooks(rankedRelated);
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  const safeImageUrl = useMemo(() => {
    return toSafeHttpUrl(book?.img_url) || toAbsoluteUrl("/preview.png");
  }, [book?.img_url]);
  const visibleTags = useMemo(() => toTagArray(book?.tags).slice(0, 6), [book?.tags]);

  const seoStructuredData = useMemo(() => {
    if (!book) return null;

    const tags = toTagArray(book.tags);

    return [
      {
        "@context": "https://schema.org",
        "@type": "Book",
        name: book.title,
        url: toAbsoluteUrl(`/pdf/${book.id}`),
        image: safeImageUrl,
        genre: book.category || "PDF",
        keywords: tags.join(", "),
        datePublished: book.created_at || undefined,
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: toAbsoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: book.category || "PDFs",
            item: toAbsoluteUrl("/categories"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: book.title,
            item: toAbsoluteUrl(`/pdf/${book.id}`),
          },
        ],
      },
    ];
  }, [book, safeImageUrl]);

  if (loading) {
    return (
      <>
        <Seo
          title="Loading PDF - PDF Lovers"
          description="Loading PDF details."
          pathname={`/pdf/${id || ""}`}
          robots="noindex, follow"
        />
        <Navbar />
        <div className="min-h-screen flex items-center justify-center flex-col gap-2 text-md text-gray-600">
          <LoaderCircle className="w-6 h-6 animate-spin text-gray-500" />
          <p className="font-display font-bold text-md">Loading book...</p>
        </div>
      </>
    );
  }

  if (!book) {
    return (
      <>
        <Seo
          title="Book Not Found - PDF Lovers"
          description="This PDF page is not available."
          pathname={`/pdf/${id || ""}`}
          robots="noindex, follow"
        />
        <Navbar />
        <div className="min-h-screen flex items-center justify-center flex-col text-md text-gray-600">
          <p className="font-display font-bold text-lg">Book not found.</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-black transition font-display underline"
          >
            Back to Library
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${book.title} - PDF Lovers`}
        description={`Read and download ${book.title} PDF free from PDF Lovers.`}
        pathname={`/pdf/${book.id}`}
        image={safeImageUrl}
        type="article"
        keywords={`${book.title}, ${book.category || "pdf"}, free pdf download`}
        structuredData={seoStructuredData}
      />

      <Navbar />

      <div className="min-h-screen bg-white pt-15">
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition font-display"
          >
            <ArrowLeft size={16} />
            Back to Library
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row gap-10 md:gap-14">
            <div className="w-full md:w-[320px]">
              <div className="aspect-3/4 rounded-3xl bg-gray-100 overflow-hidden shadow-sm">
                <img
                  src={safeImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.01]"
                />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {book.category}
              </span>

              <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-snug">
                {book.title}
              </h1>

              <p className="text-sm text-gray-500 font-display">
                Free resource | Uploaded {new Date(book.created_at).toLocaleDateString()}
              </p>

              <div className="flex flex-row items-stretch gap-2">
                {book.pdf_link && (
                  <button
                    type="button"
                    onClick={handleDownloadClick}
                    className="font-display inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-all duration-300 ease-out shadow-sm"
                  >
                    <Download size={20} />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">Download</span>
                      <span className="text-xs text-white/60">PDF format | Free</span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: document.title,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="font-display inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-all duration-300 ease-out shadow-sm"
                >
                  <Share2 />
                </button>
              </div>

              {visibleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {visibleTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black transition-all duration-300 ease-out"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {relatedBooks.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg sm:text-xl font-semibold text-gray-900">
                  Related Books
                </h2>
                <p className="font-display text-sm text-gray-500">More like this -&gt;</p>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-3 no-scrollbar scroll-smooth snap-x snap-mandatory">
                {relatedBooks.map((b) => (
                  <div
                    key={b.id}
                    className="shrink-0 snap-start transition-transform duration-300 ease-out hover:-translate-y-0.5"
                  >
                    <BookCard book={b} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
