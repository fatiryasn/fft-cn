"use client";

import CurrencyInput from "react-currency-input-field";
import { FaPlus, FaSearch } from "react-icons/fa";
import { FaX } from "react-icons/fa6";

import FieldError from "@/components/shared/FieldError";
import type { TransactionForm } from "../../_hooks/useTransactionForm";

interface Props {
  form: TransactionForm;
  disabled: boolean;
}

export function EntriesStep({ form, disabled }: Props) {
  const {
    purpose,
    entries,
    errors,
    openAccountPicker,
    updateEntryAmount,
    removeEntryRow,
  } = form;

  if (purpose !== "account_transfer") {
    return (
      <div className="space-y-4">
        <h3 className="md:text-lg font-semibold">Akun & Nominal</h3>

        <div className="space-y-2">
          {errors.entries && <FieldError message={errors.entries} />}
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-2 items-center sm:items-start">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <label className="block text-xs md:text-sm font-medium mb-1">
                    Akun
                  </label>
                  <button
                    type="button"
                    onClick={() => openAccountPicker(i)}
                    disabled={disabled}
                    className="w-full text-left px-4 py-2 border border-gray-200 shadow rounded-lg bg-white hover:bg-gray-50 text-sm md:text-base truncate"
                  >
                    {entry.account_name || "Pilih akun..."}
                  </button>
                  {errors[`account_${i}`] && (
                    <FieldError
                      message={errors[`account_${i}`]}
                      className="pt-1"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs md:text-sm font-medium mb-1">
                    Nominal
                  </label>
                  <CurrencyInput
                    value={entry.amount}
                    onValueChange={(value) => updateEntryAmount(i, value)}
                    placeholder="Rp 0"
                    prefix="Rp "
                    groupSeparator="."
                    decimalSeparator=","
                    decimalsLimit={2}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
                  />
                  {errors[`amount_${i}`] && (
                    <FieldError
                      message={errors[`amount_${i}`]}
                      className="pt-1"
                    />
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeEntryRow(i)}
                disabled={disabled}
                className="p-2 text-red-500 hover:text-red-700 sm:self-end"
              >
                <FaX className="font-bold" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openAccountPicker(null)}
          disabled={disabled}
          className="flex items-center gap-1 text-secondary font-medium text-sm md:text-base"
        >
          <FaPlus /> Tambah Akun
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="md:text-lg font-semibold">Akun Tujuan & Nominal</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Akun Tujuan</label>
        <button
          type="button"
          onClick={() => openAccountPicker(1)}
          disabled={disabled}
          className="w-full text-left px-4 py-2 border border-gray-200 shadow rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center text-sm md:text-base"
        >
          <span
            className={
              entries[1]?.account_name ? "text-gray-900" : "text-gray-400"
            }
          >
            {entries[1]?.account_name || "Pilih akun..."}
          </span>
          <FaSearch className="text-gray-400" />
        </button>
        {errors.account_1 && (
          <FieldError message={errors.account_1} className="pt-1" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nominal</label>
        <CurrencyInput
          value={entries[1]?.amount}
          onValueChange={(value) => updateEntryAmount(1, value)}
          placeholder="Rp 0"
          prefix="Rp "
          groupSeparator="."
          decimalSeparator=","
          decimalsLimit={2}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
        />
        {errors.amount_1 && (
          <FieldError message={errors.amount_1} className="pt-1" />
        )}
      </div>
    </div>
  );
}
