import BookCard from "./bookCard";

export default function BookGrid({ books, loading }) {
  if (loading) {
    return <p className="text-sm text-gray-500">Loading books...</p>;
  }

  if (!books.length) {
    return <p className="text-sm text-gray-500">No books found.</p>;
  }

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
