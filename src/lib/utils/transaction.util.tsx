import { ReactNode } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

export type Purpose = "income" | "expense" | "account_transfer";

//purpose options
export const purposeOptions: { value: Purpose; label: string; description: string }[] =
  [
    {
      value: "income",
      label: "Pemasukan",
      description: "Catat pemasukan keuangan.",
    },
    {
      value: "expense",
      label: "Pengeluaran",
      description: "Catat pengeluaran keuangan.",
    },
    {
      value: "account_transfer",
      label: "Relokasi",
      description: "Pindahkan saldo antar akun.",
    },
  ];

//purpose labels
export const purposeLabels: Record<string, string> = {
  income: "Income",
  expense: "Expense",
  account_transfer: "Relokasi",
};

// purpose badge
export const getTransactionPurposeBadge = (
  tipe: string,
  className?: string,
): ReactNode => {
  const baseClass = `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold ${className ?? "text-sm"}`;

  switch (tipe) {
    case "income":
      return (
        <span className={`${baseClass} bg-green-100 text-green-800`}>
          <FaArrowTrendUp className="text-green-600" />
          Income
        </span>
      );
    case "expense":
      return (
        <span className={`${baseClass} bg-red-100 text-red-800`}>
          <FaArrowTrendDown className="text-red-600" />
          Expense
        </span>
      );
    case "account_transfer":
      return (
        <span className={`${baseClass} bg-blue-100 text-blue-800`}>
          <FaExchangeAlt className="text-blue-600" />
          Relokasi
        </span>
      );
    default:
      return (
        <span className={`${baseClass} bg-gray-100 text-gray-800`}>{tipe}</span>
      );
  }
};

//amount color class
export const amountColorClass = (purpose: string) => {
  switch (purpose) {
    case "income":
      return "text-green-700";
    case "expense":
      return "text-red-700";
    case "account_transfer":
      return "text-blue-700";
    default:
      return "text-gray-700";
  }
};
