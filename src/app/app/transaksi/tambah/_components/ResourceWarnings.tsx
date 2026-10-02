"use client";

import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";

interface Props {
  accountCount: number;
  incomeCategoryCount: number;
  expenseCategoryCount: number;
}

export function ResourceWarnings({
  accountCount,
  incomeCategoryCount,
  expenseCategoryCount,
}: Props) {
  const hasNoAccounts = accountCount === 0;

  //category message
  const categoryMessage =
    incomeCategoryCount === 0 && expenseCategoryCount === 0
      ? {
          title: "Ups! Kategori transaksi belum ada",
          desc: "Kamu perlu tambahin kategori transaksi dulu!",
        }
      : incomeCategoryCount === 0
        ? {
            title: "Ups! Butuh kedua tipe kategori",
            desc: "Kategori transaksi pemasukan perlu kamu tambahin!",
          }
        : expenseCategoryCount === 0
          ? {
              title: "Ups! Butuh kedua tipe kategori",
              desc: "Kategori transaksi pengeluaran perlu kamu tambahin!",
            }
          : null;

  if (!hasNoAccounts && !categoryMessage) return null;

  return (
    <div className="space-y-3">
      {hasNoAccounts && (
        <div className="flex flex-col sm:flex-row items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50">
          <FaTriangleExclamation className="text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm lg:text-base font-semibold text-amber-900">
              Belum ada akun keuangan
            </p>
            <p className="text-xs lg:text-sm text-amber-800 mt-1 leading-relaxed">
              Tambahkan minimal satu akun sebelum membuat transaksi.
            </p>
          </div>
          <Link
            href="/app/settings/akun-keuangan"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-amber-700 shrink-0 flex items-center gap-1"
          >
            <FaPlus /> Tambah Akun
          </Link>
        </div>
      )}

      {categoryMessage && (
        <div className="flex flex-col sm:flex-row items-start gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50">
          <FaTriangleExclamation className="text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm lg:text-base font-semibold text-amber-900">
              {categoryMessage.title}
            </p>
            <p className="text-xs lg:text-sm text-amber-800 mt-1 leading-relaxed">
              {categoryMessage.desc}
            </p>
          </div>
          <Link
            href="/app/settings/kategori"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-amber-700 shrink-0 flex items-center gap-1"
          >
            <FaPlus /> Tambah Kategori
          </Link>
        </div>
      )}
    </div>
  );
}
