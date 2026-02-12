import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactGA from "react-ga4";

export default function SearchHero() {
  const navigate = useNavigate();

  const suggestions = [
    "Atomic Habits",
    "Machine Learning",
    "Physics Notes",
    "DSA Sheet",
    "Business",
    "AI Research",
  ];

  // ✅ State
  const [query, setQuery] = useState("");

  // ✅ Search Handler
  const handleSearch = (searchText = query) => {
    const finalQuery = searchText.trim();
    if (!finalQuery) return;

     ReactGA.event({
      category: "Search",
      action: "All",
      label: finalQuery,
    });

    // Encode query for URL safety
    const encoded = encodeURIComponent(finalQuery);

    // ✅ Smooth SPA Redirect
    navigate(`/search?q=${encoded}`);
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

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <div
            className="
              flex items-center gap-3
              bg-white/15 border border-white/20
              rounded-full
              px-2 pl-4
              py-2 
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
              placeholder="Search title, category, or tags..."
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
                p-3
                rounded-full
                text-xs sm:text-sm
                hover:bg-gray-200 transition
                shrink-0
              "
            >
              <Search strokeWidth={3} className="w-4 sm:w-6 h-4 sm:h-6" />
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
