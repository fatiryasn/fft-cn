"use client";

import { purposeOptions } from "@/lib/utils/transaction.util";
import { getAccountTypeBadge } from "@/lib/utils/account.util";
import type { TransactionForm } from "../../_hooks/useTransactionForm";

interface Props {
  form: TransactionForm;
}

export function ConfirmationStep({ form }: Props) {
  const {
    purpose,
    note,
    entries,
    images,
    transactionDate,
    transactionTime,
    useSpecificTime,
    categoryName,
  } = form;

  // Mirror the server's signed_amount logic so the preview
  // matches what actually gets written to the ledger.
  const signedAmount = (amount: number, index: number): number => {
    if (purpose === "income") return Math.abs(amount);
    if (purpose === "expense") return -Math.abs(amount);
    // account_transfer: source (0) leaves, destination (1) enters
    return index === 0 ? -Math.abs(amount) : Math.abs(amount);
  };

  // For transfers, the difference between source and destination is
  // money that leaves the system (implicit fee). Only relevant when
  // both amounts are filled and the source is larger.
  const sourceAmount = parseFloat(entries[0]?.amount || "0");
  const destAmount = parseFloat(entries[1]?.amount || "0");
  const transferFee =
    purpose === "account_transfer" &&
    entries.length === 2 &&
    sourceAmount > 0 &&
    destAmount > 0 &&
    sourceAmount > destAmount
      ? sourceAmount - destAmount
      : 0;

  return (
    <div className="space-y-6">
      <h3 className="md:text-lg font-semibold text-gray-800">
        Konfirmasi Transaksi
      </h3>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Tipe Transaksi</span>
        <span className="text-gray-900 font-medium font-lexend">
          {purposeOptions.find((o) => o.value === purpose)?.label || "-"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Keterangan</span>
        <span className="text-gray-900 font-medium font-lexend">
          {note || "-"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Tanggal Transaksi</span>
        <span className="text-gray-900 font-medium font-lexend">
          {transactionDate} {useSpecificTime ? transactionTime : ""}
        </span>
      </div>

      {purpose !== "account_transfer" && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-700">Kategori</span>
          <span className="text-gray-900 font-medium font-lexend">
            {categoryName || "Tanpa kategori"}
          </span>
        </div>
      )}

      <div>
        <span className="block text-sm text-gray-700 mb-2">Rincian Akun</span>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-secondary/10 border-b border-gray-200">
                <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-600">
                  Akun
                </th>
                <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-600">
                  Tipe
                </th>
                <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-600">
                  Nominal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry, i) => {
                const amount = parseFloat(entry.amount || "0");
                const signed = signedAmount(amount, i);
                const isNegative = signed < 0;

                return (
                  <tr key={i}>
                    <td className="px-2 md:px-4 py-2 text-gray-800 font-semibold font-lexend">
                      {entry.account_name || "-"}
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      {getAccountTypeBadge(entry.account_type ?? "", "text-xs")}
                    </td>
                    <td
                      className={`px-2 md:px-4 py-2 font-semibold ${
                        isNegative ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isNegative ? "-" : "+"}Rp{" "}
                      {Math.abs(signed).toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}

              {transferFee > 0 && (
                <tr className="border-t-2 border-gray-400">
                  <td className="px-2 md:px-4 py-2 text-amber-800 font-semibold">
                    Biaya / Selisih
                  </td>
                  <td className="px-2 md:px-4 py-2 text-amber-700 text-sm">
                    Keluar dari sistem
                  </td>
                  <td className="px-2 md:px-4 py-2 font-semibold text-amber-700">
                    -Rp {transferFee.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Bukti Transaksi</span>
        <span className="text-gray-900 font-medium font-lexend">
          {images.length > 0 ? `${images.length} file terpilih` : "Tidak ada"}
        </span>
      </div>

      <p className="text-xs text-gray-600 text-center pt-2">
        Klik "Simpan" di bawah untuk menyelesaikan transaksi.
      </p>
    </div>
  );
}
