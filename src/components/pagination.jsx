export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
      >
        Prev
      </button>

      <span className="text-sm text-gray-600">
        Page <strong>{page}</strong> of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
