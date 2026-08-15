// app/transaksi/page.tsx
"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  FaCalendar,
  FaFilter,
  FaPlus,
  FaSearch,
  FaTable,
} from "react-icons/fa";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import DataTable from "@/components/shared/DataTable";
import {
  getTransactions,
  getTransactionSummary,
  getTransactionsPeriodic,
  type Transaction,
} from "@/services/transaction.service";
import { formatRupiah, formatDate } from "@/lib/utils/common.util";
import { useRouter } from "next/navigation";
import {
  amountColorClass,
  getTransactionPurposeBadge,
  purposeLabels,
} from "@/lib/utils/transaction.util";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";

//CONSTANTS
const DEFAULT_LIMIT_TABLE = 30;
const PERIODIC_BATCH_SIZE = 20;
const FETCH_TIMEOUT_MS = 10000;

//DATATABLE COLUMN
const transactionColumns = [
  {
    key: "id",
    header: "Kode Transaksi",
    render: (row: Transaction) => (
      <span className="text-secondary font-semibold max-w-[200px] truncate block">
        {row.code}
      </span>
    ),
  },
  {
    key: "note",
    header: "Keterangan",
    render: (row: Transaction) => (
      <span className="text-gray-900 font-lexend max-w-[300px] truncate block text-sm xl:text-base">
        {row.note || "-"}
      </span>
    ),
  },
  {
    key: "category_name",
    header: "Kategori",
    render: (row: Transaction) => (
      <span className="text-gray-900 max-w-[200px] truncate block text-sm xl:text-base">
        {row.category_name || "-"}
      </span>
    ),
  },
  {
    key: "purpose",
    header: "Tipe",
    render: (row: Transaction) => (
      <span className="text-gray-900 max-w-[200px] truncate block">
        {getTransactionPurposeBadge(row.purpose, "text-xs xl:text-xs")}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Jumlah",
    render: (row: Transaction) => (
      <span
        className={`font-medium ${amountColorClass(row.purpose)} max-w-[200px] truncate block text-sm xl:text-base"`}
      >
        {formatRupiah(Math.abs(row.amount))}
      </span>
    ),
    className: "text-right",
  },
  {
    key: "transaction_at",
    header: "Tanggal",
    render: (row: Transaction) => (
      <span className="text-gray-900 max-w-[200px] truncate block text-sm xl:text-base">
        {formatDate(row.transaction_at)}
      </span>
    ),
  },
];

const Page = () => {
  const router = useRouter();

  //STATES
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterPurpose, setFilterPurpose] = useState<
    "semua" | "income" | "expense" | "account_transfer"
  >("semua");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [mode, setMode] = useState<"table" | "periodic">("table");

  //table states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT_TABLE);
  const [tableData, setTableData] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingTable, setLoadingTable] = useState(true);
  const [errorTable, setErrorTable] = useState<string | null>(null);

  //periodic states
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loadingPeriodic, setLoadingPeriodic] = useState(false);
  const [errorPeriodic, setErrorPeriodic] = useState<string | null>(null);
  const [hasMorePeriodic, setHasMorePeriodic] = useState(true);
  const [cursorPeriodic, setCursorPeriodic] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Add these refs near the other refs
  const isFetchingPeriodicRef = useRef(false);
  const cursorPeriodicRef = useRef<string | null>(null);

  //summary states
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  //periodic grouping
  const groupedByDate = useMemo(() => {
    const groupsMap: Record<string, Transaction[]> = {};
    allTransactions.forEach((tx) => {
      const localDate = new Date(tx.transaction_at).toLocaleDateString("sv-SE");
      if (!groupsMap[localDate]) groupsMap[localDate] = [];
      groupsMap[localDate].push(tx);
    });
    return Object.keys(groupsMap)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({ date, transactions: groupsMap[date] }));
  }, [allTransactions]);

  //FETCH SUMMARY
  const fetchSummary = useCallback(async () => {
    try {
      const summary = await getTransactionSummary();
      setTotalIncome(summary.totalIncome);
      setTotalExpense(summary.totalExpense);
    } catch (e) {}
  }, []);
  //FETCH TABLE DATA
  const fetchTableData = useCallback(async () => {
    setLoadingTable(true);
    setErrorTable(null);
    try {
      const result = await getTransactions({
        search: debouncedSearch,
        purpose: filterPurpose,
        page: currentPage,
        itemsPerPage: limit,
      });

      if ("error" in result) {
        setErrorTable(result.error || "Terjadi kesalahan");
      } else {
        setTableData(result.transactions);
        setTotalCount(result.totalCount);
      }
    } catch (e: any) {
      setErrorTable(e.message || "Gagal memuat data");
    } finally {
      setLoadingTable(false);
    }
  }, [debouncedSearch, filterPurpose, currentPage, limit]);
  //FETCH PERIODIC DATA
  const fetchPeriodic = useCallback(
    async (reset = false) => {
      if (isFetchingPeriodicRef.current) return;
      isFetchingPeriodicRef.current = true;

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      setLoadingPeriodic(true);
      setErrorPeriodic(null);

      try {
        const cursor = reset ? undefined : cursorPeriodicRef.current;

        const result = await getTransactionsPeriodic({
          search: debouncedSearch,
          purpose: filterPurpose,
          limit: PERIODIC_BATCH_SIZE,
          cursor: cursor || undefined,
        });

        if ("error" in result) {
          setErrorPeriodic(result.error || "Terjadi kesalahan");
          return;
        }

        if (reset) {
          setAllTransactions(result.transactions);
        } else {
          setAllTransactions((prev) => [...prev, ...result.transactions]);
        }

        setHasMorePeriodic(result.hasMore);
        cursorPeriodicRef.current = result.nextCursor ?? null;
        setCursorPeriodic(result.nextCursor ?? null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorPeriodic(err.message || "Gagal memuat data");
        }
      } finally {
        clearTimeout(timeoutId);
        setLoadingPeriodic(false);
        isFetchingPeriodicRef.current = false;
      }
    },
    [debouncedSearch, filterPurpose],
  );

  //INTERSECTION OBSERVER
  useEffect(() => {
    if (mode !== "periodic") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMorePeriodic &&
          !loadingPeriodic &&
          !errorPeriodic
        ) {
          fetchPeriodic(false);
        }
      },
      { threshold: 0.1 },
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [mode, hasMorePeriodic, loadingPeriodic, errorPeriodic, fetchPeriodic]);

  //FETCH EFFECTS
  useEffect(() => {
    fetchSummary();
  }, []);
  useEffect(() => {
    if (mode === "table") {
      fetchTableData();
    }
  }, [fetchTableData, mode]);
  useEffect(() => {
    if (mode === "periodic") {
      setAllTransactions([]);
      setHasMorePeriodic(true);
      cursorPeriodicRef.current = null;
      setCursorPeriodic(null);
      setErrorPeriodic(null);
      fetchPeriodic(true);
    }
  }, [mode, debouncedSearch, filterPurpose, fetchPeriodic]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  //HANDLERS
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };
  const retryPeriodic = () => {
    setErrorPeriodic(null);
    fetchPeriodic(allTransactions.length === 0);
  };

  //RENDER
  return (
    <div className="mx-auto space-y-6">
      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-gray-200 shadow rounded-xl p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-100 p-2 rounded-lg">
              <FaArrowTrendDown className="text-red-600 text-xs md:text-sm" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide">
              Total Pengeluaran
            </span>
          </div>
          <p className="text-base md:text-xl lg:text-2xl font-bold">
            {formatRupiah(totalExpense)}
          </p>
        </div>

        <div className="bg-surface border border-gray-200 shadow rounded-xl p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaArrowTrendUp className="text-green-600 text-xs md:text-sm" />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide">
              Total Pemasukan
            </span>
          </div>
          <p className="text-base md:text-xl lg:text-2xl font-bold">
            {formatRupiah(totalIncome)}
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
            {filterPurpose !== "semua" && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                {purposeLabels[filterPurpose] || filterPurpose}
              </span>
            )}
          </button>
          {showFilterDropdown && (
            <div className="absolute left-0 mt-1 w-48 bg-surface border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="absolute left-0 mt-1 w-48 bg-surface border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setFilterPurpose("semua");
                    setShowFilterDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 ${
                    filterPurpose === "semua"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : ""
                  }`}
                >
                  Semua
                </button>
                {Object.entries(purposeLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setFilterPurpose(value as any);
                      setShowFilterDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 ${
                      filterPurpose === value
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : ""
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 shadow rounded-lg px-4 py-4 sm:py-2 bg-surface w-full sm:w-auto order-4 sm:order-2">
          <FaSearch />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-40 lg:w-56 text-xs md:text-sm focus:outline-none bg-transparent"
          />
        </div>

        {/* Spacer – only visible on sm+ screens, pushes mode & tambah to the right */}
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
            onClick={() => setMode("periodic")}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "periodic"
                ? "bg-secondary/5 shadow text-secondary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaCalendar />
            <span className="hidden md:inline">Periodic</span>
          </button>
        </div>

        {/* Add Button */}
        <Link
          href="/app/transaksi/tambah"
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg shadow hover:bg-secondary/90 transition-colors text-xs md:text-sm font-medium order-3 sm:order-5 ml-auto sm:ml-0 flex-shrink-0"
        >
          <FaPlus /> Tambah
        </Link>
      </div>

      {/* DATA */}
      {mode === "table" ? (
        <>
          {loadingTable && <LoadingState />}
          {errorTable && <ErrorState error={errorTable} />}
          {!loadingTable && !errorTable && tableData.length === 0 && (
            <EmptyState message="Tidak ada transaksi ditemukan." />
          )}
          {!loadingTable && !errorTable && tableData.length > 0 && (
            <DataTable
              columns={transactionColumns}
              data={tableData}
              onRowClick={(row) => router.push(`/app/transaksi/${row.id}`)}
              pagination={{
                currentPage,
                totalPages: Math.ceil(totalCount / limit),
                onPageChange: handlePageChange,
                totalItems: totalCount,
                limit,
                onLimitChange: handleLimitChange,
                limitOptions: [30, 50, 80],
              }}
            />
          )}
        </>
      ) : (
        /* Periodic Mode */
        <div className="space-y-6">
          {groupedByDate.map(({ date, transactions }) => (
            <div
              key={date}
              className="bg-surface border border-gray-200 shadow rounded-xl overflow-hidden"
            >
              <div className="bg-secondary/5 border-b border-gray-200 px-5 py-3">
                <h3 className="font-semibold text-secondary text-xs md:text-sm tracking-wide">
                  {new Date(date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => router.push(`/app/transaksi/${t.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium font-lexend text-gray-900 text-sm md:text-base">
                        {t.note || "Tanpa keterangan"}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {t.category_name || "Tanpa kategori"} &middot; {t.code}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      {getTransactionPurposeBadge(
                        t.purpose,
                        "text-xs md:text-sm",
                      )}
                      <p
                        className={`text-sm font-semibold ${amountColorClass(t.purpose)}`}
                      >
                        {formatRupiah(Math.abs(t.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* LOADING / ERROR */}
          {loadingPeriodic && <LoadingState />}
          {errorPeriodic && !loadingPeriodic && (
            <ErrorState error={errorPeriodic} onRetry={retryPeriodic} />
          )}
          {!loadingPeriodic && !errorPeriodic && hasMorePeriodic && (
            <div ref={observerRef} className="h-10" />
          )}
          {!hasMorePeriodic && allTransactions.length > 0 && (
            <p className="text-center text-gray-500 text-sm">
              Semua transaksi telah ditampilkan.
            </p>
          )}
          {!loadingPeriodic &&
            allTransactions.length === 0 &&
            !errorPeriodic && (
              <EmptyState message="Tidak ada transaksi ditemukan." />
            )}
        </div>
      )}
    </div>
  );
};

export default Page;
