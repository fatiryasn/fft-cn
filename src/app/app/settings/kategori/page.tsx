// app/settings/kategori/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaFilter, FaPlus, FaSearch, FaTable, FaTh } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import {
  getCategories,
  getCategorySummary,
  type Category,
} from "@/services/category.service";
import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import {
  typeLabels,
  getCategoryTypeBadge,
  truncateDescription,
} from "@/lib/utils/category.util";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils/common.util";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";

//CAT COLUMNS
const categoryColumns = [
  {
    key: "name",
    header: "Nama Kategori",
    render: (row: Category) => (
      <span className="font-semibold text-gray-900 max-w-[250px] truncate block text-sm xl:text-base font-lexend">
        {row.name}
      </span>
    ),
  },
  {
    key: "type",
    header: "Tipe",
    render: (row: Category) => (
      <span className="max-w-[150px] truncate block">
        {getCategoryTypeBadge(row.type, "text-xs xl:text-xs")}
      </span>
    ),
  },
  {
    key: "description",
    header: "Deskripsi",
    render: (row: Category) => (
      <span className="text-gray-600 max-w-[200px] truncate block text-sm xl:text-base">
        {truncateDescription(row.description, 50)}
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Tanggal Dibuat",
    render: (row: Category) => (
      <span className="text-gray-900 max-w-[150px] truncate block text-sm xl:text-base">
        {formatDate(row.created_at)}
      </span>
    ),
  },
];

const Page = () => {
  const router = useRouter();

  //STATES
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState<"semua" | "income" | "expense">(
    "semua",
  );
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [mode, setMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(30);

  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [incomeCount, setIncomeCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / limit);

  //FETCH CATEGORIES
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCategories({
        search: debouncedSearch,
        type: filterType,
        page: currentPage,
        itemsPerPage: limit,
      });

      if ("error" in result) {
        setError(result.error || "Terjadi kesalahan");
      } else {
        setCategories(result.categories);
        setTotalCount(result.totalCount);
      }
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterType, currentPage, limit]);

  //FETCH SUMMARY
  const fetchSummary = useCallback(async () => {
    try {
      const summary = await getCategorySummary();
      setIncomeCount(summary.incomeCount);
      setExpenseCount(summary.expenseCount);
    } catch (e) {}
  }, []);

  //EFFECTS
  useEffect(() => {
    fetchSummary();
  }, []);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, mode, limit]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  //HELPERS
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto space-y-6">
      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-gray-200 shadow rounded-xl p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaArrowTrendUp className="text-green-600 text-xs md:text-sm" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide">
              Kategori Pemasukan
            </span>
          </div>
          <p className="text-base md:text-xl lg:text-2xl font-bold">
            {incomeCount} Kategori
          </p>
        </div>

        <div className="bg-surface border border-gray-200 shadow rounded-xl p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <FaArrowTrendDown className="text-red-600 text-xs md:text-sm" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide">
              Kategori Pengeluaran
            </span>
          </div>
          <p className="text-base md:text-xl lg:text-2xl font-bold">
            {expenseCount} Kategori
          </p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-3">
        {/* Filter */}
        <div className="relative order-1">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 bg-surface hover:bg-gray-100 transition px-3 sm:px-5 py-2 rounded-lg border border-gray-200 shadow flex-shrink-0"
          >
            <FaFilter />
            <span className="hidden md:inline">Filter</span>
            {filterType !== "semua" && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                {typeLabels[filterType]}
              </span>
            )}
          </button>
          {showFilterDropdown && (
            <div className="absolute left-0 mt-1 w-48 bg-surface border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setFilterType("semua");
                  setShowFilterDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 ${
                  filterType === "semua"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : ""
                }`}
              >
                Semua
              </button>
              {Object.entries(typeLabels).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => {
                    setFilterType(value as "income" | "expense");
                    setShowFilterDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 ${
                    filterType === value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 shadow rounded-lg px-4 py-4 sm:py-2 bg-surface w-full sm:w-auto order-4 sm:order-2">
          <FaSearch />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-40 lg:w-56 text-xs md:text-sm focus:outline-none bg-transparent"
          />
        </div>

        {/* Spacer */}
        <div className="hidden sm:flex flex-1 order-3" />

        {/* Mode Toggle */}
        <div className="flex items-center bg-surface border border-gray-200 shadow rounded-lg order-2 sm:order-4 flex-shrink-0">
          <button
            onClick={() => setMode("table")}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "table"
                ? "bg-secondary/5 shadow text-secondary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaTable />
            <span className="hidden md:inline">Table</span>
          </button>
          <button
            onClick={() => setMode("grid")}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "grid"
                ? "bg-secondary/5 shadow text-secondary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaTh />
            <span className="hidden md:inline">Grid</span>
          </button>
        </div>

        {/* Add Button */}
        <Link
          href="/app/settings/kategori/tambah"
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg shadow hover:bg-secondary/90 transition-colors text-xs md:text-sm font-medium order-3 sm:order-5 ml-auto sm:ml-0 flex-shrink-0"
        >
          <FaPlus /> Tambah
        </Link>
      </div>

      {/* DATA */}
      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {!loading && !error && categories.length === 0 && (
        <EmptyState message="Tidak ada kategori transaksi ditemukan" />
      )}

      {/* Table Mode */}
      {!loading && !error && categories.length > 0 && mode === "table" && (
        <DataTable
          columns={categoryColumns}
          data={categories}
          onRowClick={(row) => router.push(`/app/settings/kategori/${row.id}`)}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: handlePageChange,
            totalItems: totalCount,
            limit,
            onLimitChange: handleLimitChange,
            limitOptions: [30, 50, 80],
          }}
        />
      )}

      {/* Grid Mode */}
      {!loading && !error && categories.length > 0 && mode === "grid" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-surface border border-gray-200 shadow rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/app/settings/kategori/${cat.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate pr-2">
                    {cat.name}
                  </h3>
                  {getCategoryTypeBadge(cat.type, "text-xs")}
                </div>
                <p className="text-sm text-gray-800 mb-3 truncate">
                  {truncateDescription(cat.description, 50)}
                </p>
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600">
                  {formatDate(cat.created_at)}
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalCount}
            limit={limit}
            onLimitChange={handleLimitChange}
            limitOptions={[30, 50, 80]}
          />
        </>
      )}
    </div>
  );
};

export default Page;
