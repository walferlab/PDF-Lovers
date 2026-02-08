import { useNavigate } from "react-router-dom";

export default function BookCard({ book }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/pdf/${book.id}`)}
      className="w-37.5 sm:w-45 cursor-pointer group"
    >
      {/* Image */}
      <div className="w-full aspect-3/4 rounded-xl bg-gray-400 overflow-hidden">
        {book.img_url && (
          <img
            src={book.img_url}
            alt={book.title}
            className="w-full h-full object-cover object-center"
          />
        )}
      </div>

      {/* Title */}
      <p className="mt-2 text-sm font-medium text-gray-800 line-clamp-2">
        {book.title}
      </p>
    </div>
  );
}
