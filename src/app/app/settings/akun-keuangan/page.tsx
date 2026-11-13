// app/settings/akun-keuangan/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FaFilter,
  FaMoneyBillWave,
  FaPlus,
  FaSearch,
  FaTable,
  FaTh,
} from "react-icons/fa";
import { FaWallet } from "react-icons/fa6";
import { getAccounts, getAccountSummary } from "@/services/account.service";
import DataTable from "@/components/shared/DataTable";
import Pagination from "@/components/shared/Pagination";
import {
  typeLabels,
  getAccountTypeBadge,
  type Account,
  formatCurrentBalance,
} from "@/lib/utils/account.util";
import { formatDate, formatRupiah } from "@/lib/utils/common.util";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";

//ACC COLUMNS
const accountColumns = [
  {
    key: "name",
    header: "Nama Akun",
    render: (row: Account) => (
      <span className="font-semibold text-gray-900 max-w-[300px] truncate block text-sm xl:text-base font-lexend">
        {row.name}
      </span>
    ),
  },
  {
    key: "type",
    header: "Tipe Akun",
    render: (row: Account) => (
      <span className="max-w-[200px] truncate block">
        {getAccountTypeBadge(row.type, "text-xs xl:text-xs")}
      </span>
    ),
  },
  {
    key: "initial_balance",
    header: "Saldo Awal",
    render: (row: Account) => (
      <span className="text-gray-700 font-medium max-w-[200px] truncate block text-sm xl:text-base">
        {formatRupiah(row.initial_balance)}
      </span>
    ),
    className: "text-right",
  },
  {
    key: "current_balance",
    header: "Saldo Saat Ini",
    render: (row: Account) => (
      <span className="font-semibold max-w-[200px] truncate block text-sm xl:text-base">
        {formatCurrentBalance(row.current_balance, row.initial_balance)}
      </span>
    ),
    className: "text-right",
  },
  {
    key: "created_at",
    header: "Tanggal Dibuat",
    render: (row: Account) => (
      <span className="text-gray-900 max-w-[200px] truncate block text-sm xl:text-base">
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
  const [filterType, setFilterType] = useState<"semua" | "cash" | "cashless">(
    "semua",
  );
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [mode, setMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(30);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [cashCount, setCashCount] = useState(0);
  const [cashlessCount, setCashlessCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / limit);

  //FETCH ACCOUNTS
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAccounts({
        search: debouncedSearch,
        type: filterType,
        page: currentPage,
        itemsPerPage: limit,
      });

      if ("error" in result) {
        setError(result.error || "Terjadi kesalahan");
      } else {
        setAccounts(result.accounts);
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
      const summary = await getAccountSummary();
      setCashCount(summary.cashCount);
      setCashlessCount(summary.cashlessCount);
    } catch (e) {}
  }, []);

  //EFFECTS
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMode("grid");
      } else {
        setMode("table");
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, []);
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterType, mode, limit]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto space-y-6">
      {/* CARDS */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-gray-200 shadow rounded-xl p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaMoneyBillWave className="text-green-600 text-xs md:text-sm" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide">
              Akun Cash
            </span>
          </div>
          <p className="text-base md:text-xl lg:text-2xl font-bold">
            {cashCount} Akun
          </p>
        </div>

        <div className="bg-surface border border-gray-200 shadow rounded-xl p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaWallet className="text-blue-600 text-xs md:text-sm" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide">
              Akun Cashless
            </span>
          </div>
          <p className="text-base md:text-xl lg:text-2xl font-bold">
            {cashlessCount} Akun
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
                    setFilterType(value as "cash" | "cashless");
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
            placeholder="Cari akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-40 lg:w-56 text-xs md:text-sm focus:outline-none bg-transparent"
          />
        </div>

        {/* Spacer */}
        <div className="hidden sm:flex flex-1 order-3" />

        {/* Mode Toggle */}
        <div className="hidden sm:flex items-center bg-surface border border-gray-200 shadow rounded-lg order-4 flex-shrink-0">
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
          href="/app/settings/akun-keuangan/tambah"
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg shadow hover:bg-secondary/90 transition-colors text-xs md:text-sm font-medium order-3 sm:order-5 ml-auto sm:ml-0 flex-shrink-0"
        >
          <FaPlus /> Tambah
        </Link>
      </div>

      {/* DATA */}
      {loading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {!loading && !error && accounts.length === 0 && (
        <EmptyState message="Tidak ada akun keuangan ditemukan" />
      )}

      {/* Table Mode */}
      {!loading && !error && accounts.length > 0 && mode === "table" && (
        <DataTable
          columns={accountColumns}
          data={accounts}
          onRowClick={(row) =>
            router.push(`/app/settings/akun-keuangan/${row.id}`)
          }
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
      {!loading && !error && accounts.length > 0 && mode === "grid" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map((account) => {
              const diff =
                Number(account.current_balance) -
                Number(account.initial_balance);
              const isPositive = diff > 0;
              const isNegative = diff < 0;
              const formattedDiff = isPositive
                ? `+${formatRupiah(diff)}`
                : isNegative
                  ? `-${formatRupiah(Math.abs(diff))}`
                  : formatRupiah(0);

              return (
                <div
                  key={account.id}
                  onClick={() =>
                    router.push(`/app/settings/akun-keuangan/${account.id}`)
                  }
                  className="group relative overflow-hidden bg-surface border border-gray-300/80 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-secondary/30"
                >
                  {/* Header */}
                  <div className="relative flex items-start justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-xl ${account.type == "cash" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"} flex items-center justify-center`}
                      >
                        <FaWallet />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 text-base truncate group-hover:text-secondary transition-colors">
                          {account.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {getAccountTypeBadge(account.type, "text-xs")}
                    </div>
                  </div>

                  {/* balance */}
                  <div className="relative">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Saldo Saat Ini
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">
                        {formatRupiah(account.current_balance)}
                      </p>
                    </div>
                    {diff !== 0 && (
                      <p
                        className={`text-xs ${
                          isPositive
                            ? "text-green-600"
                            : isNegative
                              ? "text-red-600"
                              : "text-gray-500"
                        }`}
                      >
                        {formattedDiff}{" "}
                        <span className="text-gray-600">dari saldo awal</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
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
