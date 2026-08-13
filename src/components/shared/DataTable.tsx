// components/shared/DataTable.tsx
"use client";

import { ReactNode } from "react";
import Pagination from "./Pagination";

export interface Column<T = any> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  hidden?: "sm" | "md" | "lg" | boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    limit: number;
    onLimitChange: (limit: number) => void;
    limitOptions?: number[];
  };
  wrapperClassName?: string;
}

function getHiddenClass(hidden?: string | boolean): string {
  if (!hidden) return "";
  if (hidden === "sm") return "hidden sm:table-cell";
  if (hidden === "md") return "hidden md:table-cell";
  if (hidden === "lg") return "hidden lg:table-cell";
  if (hidden === true) return "hidden";
  return "";
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = "Tidak ada data ditemukan.",
  onRowClick,
  pagination,
  wrapperClassName = "",
}: DataTableProps<T>) {
  return (
    <div>
      <div
        className={`overflow-x-auto rounded-lg border border-gray-200 shadow bg-surface ${wrapperClassName}`}
      >
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/5">
              {columns.map((col, idx) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-semibold text-secondary text-left border-r border-gray-200 text-xs md:text-sm xl:text-base ${
                    idx === 0 ? "rounded-tl-xl" : ""
                  } ${idx === columns.length - 1 ? "rounded-tr-xl" : ""} ${getHiddenClass(
                    col.hidden,
                  )}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-gray-500"
                >
                  Memuat data...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`${
                    onRowClick ? "cursor-pointer" : ""
                  } group hover:bg-secondary/5 transition-colors border-b border-gray-200`}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key}
                      className={`px-4 py-4 border-r border-gray-200 ${getHiddenClass(
                        col.hidden,
                      )} ${col.className || ""}`}
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onLimitChange={pagination.onLimitChange}
          limitOptions={pagination.limitOptions}
        />
      )}
    </div>
  );
}
