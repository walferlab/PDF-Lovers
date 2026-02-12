import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BookCard({ book }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const id = book?.id;
  const title = book?.title || "Untitled";
  const imgUrl = book?.img_url || "";

  const openBook = () => {
    if (!id) return;
    navigate(`/pdf/${id}`);
  };

  if (!book) return null;

  return (
    <button
      type="button"
      onClick={openBook}
      className="w-37.5 sm:w-45 cursor-pointer group text-left"
      aria-label={`Open ${title}`}
    >
      <div className="relative w-full aspect-3/4 rounded-xl bg-gray-200 overflow-hidden">
        {!!imgUrl && !imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}

        {imgUrl && (
          <img
            src={imgUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>

      <p className="mt-2 text-sm font-medium text-gray-800 line-clamp-2 min-h-10">
        {title}
      </p>
    </button>
  );
}
