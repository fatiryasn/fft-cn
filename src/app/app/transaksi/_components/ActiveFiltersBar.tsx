"use client";

import { useMemo, type ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

import {
  type TransactionFilters,
  DEFAULT_TRANSACTION_FILTERS,
} from "@/types/transaction";
import { purposeLabels } from "@/lib/utils/transaction.util";
import { formatDate } from "@/lib/utils/common.util";

interface ActiveFiltersBarProps {
  filters: TransactionFilters;
  onChange: (next: TransactionFilters) => void;
}

export const countActiveFilters = (filters: TransactionFilters): number =>
  (filters.purpose !== "semua" ? 1 : 0) +
  (filters.categoryIds.length > 0 ? 1 : 0) +
  (filters.accountIds.length > 0 ? 1 : 0) +
  (filters.dateFrom || filters.dateTo ? 1 : 0);

const Chip = ({
  children,
  onRemove,
}: {
  children: ReactNode;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-medium text-gray-800">
    {children}
    <button
      type="button"
      onClick={onRemove}
      aria-label="Hapus filter"
      className="rounded-full p-0.5 transition-colors hover:bg-secondary/20"
    >
      <FaTimes className="text-[10px]" />
    </button>
  </span>
);

export default function ActiveFiltersBar({
  filters,
  onChange,
}: ActiveFiltersBarProps) {
  const dateLabel = useMemo(() => {
    if (filters.dateFrom && filters.dateTo) {
      return `${formatDate(filters.dateFrom, false)} – ${formatDate(filters.dateTo, false)}`;
    }
    if (filters.dateFrom) return `Sejak ${formatDate(filters.dateFrom, false)}`;
    if (filters.dateTo) return `Hingga ${formatDate(filters.dateTo, false)}`;
    return null;
  }, [filters.dateFrom, filters.dateTo]);

  if (countActiveFilters(filters) === 0) return null;

  const update = (patch: Partial<TransactionFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.purpose !== "semua" && (
        <Chip onRemove={() => update({ purpose: "semua" })}>
          Tipe: {purposeLabels[filters.purpose] ?? filters.purpose}
        </Chip>
      )}

      {filters.categoryIds.length > 0 && (
        <Chip onRemove={() => update({ categoryIds: [] })}>
          {filters.categoryIds.length} kategori
        </Chip>
      )}

      {filters.accountIds.length > 0 && (
        <Chip onRemove={() => update({ accountIds: [] })}>
          {filters.accountIds.length} akun
        </Chip>
      )}

      {dateLabel && (
        <Chip onRemove={() => update({ dateFrom: null, dateTo: null })}>
          {dateLabel}
        </Chip>
      )}

      <button
        type="button"
        onClick={() => onChange({ ...DEFAULT_TRANSACTION_FILTERS })}
        className="ml-1 text-xs font-medium text-red-600 hover:underline"
      >
        Hapus semua
      </button>
    </div>
  );
}
