// lib/utils/account.ts
import type { ReactNode } from "react";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa";
import { formatRupiah } from "./common.util";

// ---------- Labels & badges ----------
export const typeLabels: Record<string, string> = {
  cash: "Cash",
  cashless: "Cashless",
};

export const getAccountTypeBadge = (tipe: string, className?: string): ReactNode => {
  const baseClass = `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-semibold ${className ?? ""}`;

  switch (tipe) {
    case "cash":
      return (
        <span className={`${baseClass} bg-green-100 text-green-800`}>
          <FaMoneyBillWave className="text-green-600" />
          Cash
        </span>
      );
    case "cashless":
      return (
        <span className={`${baseClass} bg-blue-100 text-blue-800`}>
          <FaWallet className="text-blue-600" />
          Cashless
        </span>
      );
    default:
      return (
        <span className={`${baseClass} bg-gray-100 text-gray-800`}>{tipe}</span>
      );
  }
};

export const formatCurrentBalance = (current: number, initial: number) => {
  const diff = current - initial;
  const formatted = formatRupiah(current);
  if (diff > 0) {
    return <span className="text-green-600 font-semibold">+{formatted}</span>;
  } else if (diff < 0) {
    return <span className="text-red-600 font-semibold">{formatted}</span>;
  }
  return <span className="font-semibold">{formatted}</span>;
};

// ---------- Account interface ----------
export interface Account {
  id: string;
  name: string;
  type: "cash" | "cashless";
  initial_balance: number;
  current_balance: number;
  created_at: string;
}

