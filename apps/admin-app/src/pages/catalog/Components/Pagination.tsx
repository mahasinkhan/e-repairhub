type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <div className="flex gap-2">
      <button
        disabled={page === 1}
        onClick={() =>
          onPageChange(page - 1)
        }
      >
        Prev
      </button>

      <span>
        {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() =>
          onPageChange(page + 1)
        }
      >
        Next
      </button>
    </div>
  );
}