"use client";

import { useEffect, useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import {
  getAllAccountsForFilter,
  getAllCategoriesForFilter,
} from "@/services/transaction.service";
import { purposeLabels } from "@/lib/utils/transaction.util";
import Spinner from "@/components/shared/Spinner";
import {
  DEFAULT_TRANSACTION_FILTERS,
  TransactionPurposeFilter,
  type TransactionFilters,
} from "@/types/transaction";

//INTERFACES
interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}
interface Account {
  id: string;
  name: string;
  type: "cash" | "cashless";
  current_balance: string | number;
}
interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
}

function setsEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
}

export default function TransactionFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
}: Props) {
  const [draft, setDraft] = useState<TransactionFilters>(filters);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //sync filters
  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  //get data
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getAllCategoriesForFilter(), getAllAccountsForFilter()])
      .then(([catRes, accRes]) => {
        if (cancelled) return;
        if ("error" in catRes)
          setError(catRes.error || "Gagal memuat kategori");
        else setCategories(catRes.categories);
        if ("error" in accRes)
          setError((prev) => prev || accRes.error || "Gagal memuat akun");
        else setAccounts(accRes.accounts);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  //visible categories
  const visibleCategories = useMemo(() => {
    if (draft.purpose === "income" || draft.purpose === "expense") {
      return categories.filter((c) => c.type === draft.purpose);
    }
    return categories;
  }, [categories, draft.purpose]);

  const showCategorySection = draft.purpose !== "account_transfer";

  //dirty check
  const isDirty =
    draft.purpose !== filters.purpose ||
    draft.dateFrom !== filters.dateFrom ||
    draft.dateTo !== filters.dateTo ||
    !setsEqual(draft.categoryIds, filters.categoryIds) ||
    !setsEqual(draft.accountIds, filters.accountIds);
  const isAtDefaults =
    draft.purpose === DEFAULT_TRANSACTION_FILTERS.purpose &&
    draft.dateFrom === DEFAULT_TRANSACTION_FILTERS.dateFrom &&
    draft.dateTo === DEFAULT_TRANSACTION_FILTERS.dateTo &&
    draft.categoryIds.length === 0 &&
    draft.accountIds.length === 0;

  const handlePurposeChange = (p: TransactionPurposeFilter) => {
    setDraft((prev) => {
      if (p === "account_transfer") {
        return { ...prev, purpose: p, categoryIds: [] };
      }
      if (p === "semua") {
        return { ...prev, purpose: p };
      }
      const allowed = new Set(
        categories.filter((c) => c.type === p).map((c) => c.id),
      );
      return {
        ...prev,
        purpose: p,
        categoryIds: prev.categoryIds.filter((id) => allowed.has(id)),
      };
    });
  };

  const toggleCategory = (id: string) =>
    setDraft((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));

  const toggleAccount = (id: string) =>
    setDraft((prev) => ({
      ...prev,
      accountIds: prev.accountIds.includes(id)
        ? prev.accountIds.filter((a) => a !== id)
        : [...prev.accountIds, id],
    }));

  const handleReset = () => setDraft(DEFAULT_TRANSACTION_FILTERS);

  const handleApply = () => {
    if (!isDirty) return;
    onApply(draft);
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Filter Transaksi</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 max-h-[65vh] overflow-y-auto p-4 space-y-5">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {/* purpose */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipe</label>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["semua", "income", "expense", "account_transfer"] as const
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePurposeChange(p)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                        draft.purpose === p
                          ? "bg-secondary text-white border-secondary"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p === "semua" ? "Semua" : purposeLabels[p]}
                    </button>
                  ))}
                </div>
              </div>

              {/* date range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tanggal Transaksi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={draft.dateFrom || ""}
                    max={draft.dateTo || today}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        dateFrom: e.target.value || null,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  />
                  <span className="text-gray-500 text-sm">s.d.</span>
                  <input
                    type="date"
                    value={draft.dateTo || ""}
                    min={draft.dateFrom || undefined}
                    max={today}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        dateTo: e.target.value || null,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* categories */}
              {showCategorySection && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategori
                    {draft.categoryIds.length > 0 && (
                      <span className="ml-1 text-xs font-semibold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                        {draft.categoryIds.length}
                      </span>
                    )}
                  </label>
                  <div className="border border-gray-200 rounded-lg max-h-44 overflow-y-auto">
                    {visibleCategories.length === 0 ? (
                      <p className="text-gray-500 text-sm p-3">
                        {draft.purpose === "income"
                          ? "Tidak ada kategori pemasukan"
                          : draft.purpose === "expense"
                            ? "Tidak ada kategori pengeluaran"
                            : "Tidak ada kategori"}
                      </p>
                    ) : (
                      visibleCategories.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={draft.categoryIds.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                          />
                          <span className="text-sm text-gray-900 flex-1 truncate">
                            {cat.name}
                          </span>
                          <span className="text-xs text-gray-600 capitalize">
                            {cat.type}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* accounts */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Akun
                  {draft.accountIds.length > 0 && (
                    <span className="ml-1 text-xs font-semibold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                      {draft.accountIds.length}
                    </span>
                  )}
                </label>
                <div className="border border-gray-200 rounded-lg max-h-44 overflow-y-auto">
                  {accounts.length === 0 ? (
                    <p className="text-gray-500 text-sm p-3">Tidak ada akun</p>
                  ) : (
                    accounts.map((acc) => (
                      <label
                        key={acc.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={draft.accountIds.includes(acc.id)}
                          onChange={() => toggleAccount(acc.id)}
                        />
                        <span className="text-sm text-gray-900 flex-1 truncate">
                          {acc.name}
                        </span>
                        <span className="text-xs text-gray-600 capitalize">
                          {acc.type}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={isAtDefaults}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!isDirty}
            className="flex-1 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}
