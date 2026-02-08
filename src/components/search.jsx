import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactGA from "react-ga4";

export default function SearchHero() {
  const navigate = useNavigate();

  const categories = ["Books", "Papers", "PDFs", "Notes", "Journals"];

  const suggestions = [
    "Atomic Habits",
    "Machine Learning",
    "Physics Notes",
    "DSA Sheet",
    "Business",
    "AI Research",
  ];

  // ✅ State
  const [activeCategory, setActiveCategory] = useState("Books");
  const [query, setQuery] = useState("");

  // ✅ Search Handler
  const handleSearch = (searchText = query) => {
     ReactGA.event({
    category: "Search",
    action: activeCategory,
    label: query,
  });
    if (!searchText.trim()) return;

    // Encode query for URL safety
    const encoded = encodeURIComponent(searchText);

    // ✅ Smooth SPA Redirect
    navigate(`/search?type=${activeCategory}&q=${encoded}`);
  };

  return (
    <section className="w-full bg-[#111] rounded-3xl overflow-hidden relative">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative px-5 sm:px-10 py-12 sm:py-16 max-w-5xl mx-auto space-y-8 text-center">
        
        {/* Heading */}
        <h1 className="text-2xl sm:text-5xl font-semibold text-white tracking-tight leading-snug">
          Search free books & academic resources
        </h1>

        {/* Tabs */}
        <div className="flex justify-start sm:justify-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setActiveCategory(item)}
              className={`shrink-0 px-4 py-1.5 rounded-full border text-sm transition
                ${
                  activeCategory === item
                    ? "bg-white text-black border-white"
                    : "text-white/70 border-white/20 hover:text-white hover:border-white/40"
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <div
            className="
              flex items-center gap-3
              bg-white/15 border border-white/20
              rounded-2xl sm:rounded-full
              px-4 sm:px-6
              py-3 sm:py-4
              backdrop-blur-md
            "
          >
            {/* Icon */}
            <Search className="text-white/60 shrink-0" size={20} />

            {/* Input */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              type="text"
              placeholder={`Search ${activeCategory.toLowerCase()}...`}
              className="
                w-full bg-transparent outline-none
                text-white placeholder:text-white/50
                text-sm sm:text-base
              "
            />

            {/* Button */}
            <button
              onClick={() => handleSearch()}
              className="
                bg-white text-black font-medium
                px-4 sm:px-6 py-2
                rounded-xl sm:rounded-full
                text-sm
                hover:bg-gray-200 transition
                shrink-0
              "
            >
              Search
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {suggestions.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSearch(tag)} // ✅ instant search
              className="
                shrink-0 text-xs px-3 py-1 rounded-full
                bg-white/10 border border-white/15
                text-white/70 hover:text-white
                hover:border-white/30
                cursor-pointer transition
              "
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
