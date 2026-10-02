"use client";

import CurrencyInput from "react-currency-input-field";
import { FaSearch } from "react-icons/fa";

import FieldError from "@/components/shared/FieldError";
import type { TransactionForm } from "../../_hooks/useTransactionForm";

interface Props {
  form: TransactionForm;
  disabled: boolean;
}

export function DetailStep({ form, disabled }: Props) {
  const {
    purpose,
    note,
    errors,
    transactionDate,
    transactionTime,
    useSpecificTime,
    categoryName,
    entries,
    setNote,
    setTransactionDate,
    setTransactionTime,
    setUseSpecificTime,
    openCategoryPicker,
    openAccountPicker,
    updateEntryAmount,
  } = form;

  if (purpose !== "account_transfer") {
    return (
      <div className="space-y-4">
        <h3 className="md:text-lg font-semibold">
          Detail Transaksi{" "}
          {purpose === "income"
            ? "Pemasukan"
            : purpose === "expense"
              ? "Pengeluaran"
              : ""}
        </h3>

        <div>
          <label className="block text-sm font-medium mb-1">Keterangan</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            rows={2}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
            placeholder="Deskripsi transaksi..."
          />
          {errors.note && <FieldError message={errors.note} />}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tanggal Transaksi
          </label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
          />
          {errors.transactionDate && (
            <FieldError message={errors.transactionDate} />
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs md:text-sm font-medium mb-1">
            <input
              type="checkbox"
              checked={useSpecificTime}
              onChange={(e) => setUseSpecificTime(e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            Gunakan jam spesifik
          </label>
          {useSpecificTime && (
            <input
              type="time"
              value={transactionTime}
              onChange={(e) => setTransactionTime(e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <button
            type="button"
            onClick={openCategoryPicker}
            disabled={disabled}
            className="w-full text-left px-4 py-2 border border-gray-200 shadow rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center text-sm md:text-base"
          >
            <span className={categoryName ? "text-gray-900" : "text-gray-400"}>
              {categoryName || "Pilih kategori..."}
            </span>
            <FaSearch className="text-gray-400" />
          </button>
          {errors.category && (
            <FieldError message={errors.category} className="pt-1" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="md:text-lg font-semibold">Akun Sumber & Nominal</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Akun Sumber</label>
        <button
          type="button"
          onClick={() => openAccountPicker(0)}
          disabled={disabled}
          className="w-full text-left px-4 py-2 border border-gray-200 shadow rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center text-sm md:text-base"
        >
          <span
            className={
              entries[0]?.account_name ? "text-gray-900" : "text-gray-400"
            }
          >
            {entries[0]?.account_name || "Pilih akun..."}
          </span>
          <FaSearch className="text-gray-400" />
        </button>
        {errors.account_0 && (
          <FieldError message={errors.account_0} className="pt-1" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nominal</label>
        <CurrencyInput
          value={entries[0]?.amount}
          onValueChange={(value) => updateEntryAmount(0, value)}
          placeholder="Rp 0"
          prefix="Rp "
          groupSeparator="."
          decimalSeparator=","
          decimalsLimit={2}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
        />
        {errors.amount_0 && (
          <FieldError message={errors.amount_0} className="pt-1" />
        )}
      </div>
    </div>
  );
}
