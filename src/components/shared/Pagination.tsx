// components/shared/Pagination.tsx
"use client";

import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  limit: number;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  variant?: "admin" | "public";
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  limit,
  onLimitChange,
  limitOptions = [5, 10, 15, 30], // default options
  variant = "admin",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);
  const rangeVisual =
    startItem === endItem ? endItem : `${startItem}-${endItem}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200 ">
      {/* LEFT */}
      {variant === "admin" ? (
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <span>Tampilkan</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
            className="border border-gray-300 rounded-md py-1 pl-2 pr-7 text-xs md:text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none bg-white"
          >
            {limitOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span>dari {totalItems} data</span>
        </div>
      ) : (
        <div className="text-xs md:text-sm text-gray-600">
          Menampilkan {rangeVisual} dari {totalItems} entri
        </div>
      )}

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors"
        >
          <HiOutlineChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 text-xs md:text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={currentPage === totalPages}
                className={`w-8 h-8 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors ${
                  pageNum === currentPage
                    ? "bg-secondary text-white font-medium"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {pageNum}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors"
        >
          <HiOutlineChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
