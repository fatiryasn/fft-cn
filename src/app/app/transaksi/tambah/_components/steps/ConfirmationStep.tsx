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
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td className="px-2 md:px-4 py-2 text-gray-800 font-semibold font-lexend">
                    {entry.account_name || "-"}
                  </td>
                  <td className="px-2 md:px-4 py-2">
                    {getAccountTypeBadge(entry.account_type ?? "", "text-xs")}
                  </td>
                  <td className="px-2 md:px-4 py-2 font-semibold text-gray-900">
                    Rp {parseFloat(entry.amount || "0").toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
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
