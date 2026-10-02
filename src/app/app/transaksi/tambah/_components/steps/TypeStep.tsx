"use client";

import { FaExchangeAlt } from "react-icons/fa";
import { FaArrowTrendDown, FaArrowTrendUp, FaLock } from "react-icons/fa6";
import type { ReactNode } from "react";

import { purposeOptions, type Purpose } from "@/lib/utils/transaction.util";
import FieldError from "@/components/shared/FieldError";
import type { TransactionForm } from "../../_hooks/useTransactionForm";

interface Props {
  form: TransactionForm;
  disabled: boolean;
  accountCount: number;
}

export function TypeStep({ form, disabled, accountCount }: Props) {
  const { purpose, errors, setPurpose } = form;

  const iconMap: Record<Purpose, ReactNode> = {
    income: <FaArrowTrendUp className="w-6 h-6 text-green-600" />,
    expense: <FaArrowTrendDown className="w-6 h-6 text-red-600" />,
    account_transfer: <FaExchangeAlt className="w-6 h-6 text-blue-600" />,
  };

  return (
    <div className="space-y-4">
      <h3 className="md:text-lg font-semibold text-gray-800">
        Pilih Tipe Transaksi
      </h3>

      <div className="space-y-2">
        {errors.purpose && <FieldError message={errors.purpose} />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {purposeOptions.map((opt) => {
            const isSelected = purpose === opt.value;
            const isTransferBlocked =
              opt.value === "account_transfer" && accountCount < 2;
            const isDisabled = disabled || isTransferBlocked;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => !isTransferBlocked && setPurpose(opt.value)}
                disabled={isDisabled}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition h-32 md:h-48 ${
                  isTransferBlocked
                    ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                    : isSelected
                      ? "border-secondary bg-secondary/5 text-secondary"
                      : "border-gray-200 hover:border-gray-300"
                } ${isDisabled ? "opacity-60" : ""}`}
              >
                <div className="mb-2">{iconMap[opt.value]}</div>
                <span
                  className={`text-sm md:text-base font-semibold font-poppins ${
                    isTransferBlocked
                      ? "text-gray-500"
                      : isSelected
                        ? "text-secondary"
                        : "text-gray-800"
                  }`}
                >
                  {opt.label}
                </span>
                <p
                  className={`text-xs md:text-sm mt-1 text-center leading-tight flex items-center gap-1 justify-center text-gray-600
                    `}
                >
                  {" "}
                  {opt.description}
                </p>
                {isTransferBlocked && (
                  <p
                    className={`text-xs md:text-sm mt-1 text-center leading-tight flex items-center gap-1 justify-center ${
                      isTransferBlocked
                        ? "text-amber-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    <FaLock className="w-3 h-3" /> Minimal 2 akun transaksi
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
