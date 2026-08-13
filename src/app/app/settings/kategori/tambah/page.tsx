"use client";

import { useState, useTransition } from "react";
import { FaCheckCircle, FaPlus } from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { createCategory } from "@/services/category.service";
import Spinner from "@/components/shared/Spinner";
import FieldError from "@/components/shared/FieldError";

const TambahKategoriPage = () => {
  const [nama, setNama] = useState("");
  const [tipe, setTipe] = useState<"income" | "expense" | null>(null);
  const [deskripsi, setDeskripsi] = useState("");
  const [errors, setErrors] = useState<{
    nama?: string;
    tipe?: string;
    deskripsi?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClear = () => {
    setNama("");
    setTipe(null);
    setDeskripsi("");
    setErrors({});
    setServerError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!nama.trim() || nama.trim().length < 3 || nama.trim().length > 100) {
      newErrors.nama = "Nama kategori harus 3 - 100 karakter";
    }
    if (!tipe) {
      newErrors.tipe = "Pilih tipe kategori";
    }
    if (deskripsi && deskripsi.length > 300) {
      newErrors.deskripsi = "Deskripsi maksimal 300 karakter";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      startTransition(async () => {
        const result = await createCategory({
          name: nama.trim(),
          type: tipe!,
          description: deskripsi.trim() || undefined,
        });

        if (result && result.error) {
          setServerError(result.error);
        }
      });
    }
  };

  return (
    <div className="bg-surface shadow rounded-xl border border-gray-200 mx-auto">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* Server Error */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs md:text-sm">
            {serverError}
          </div>
        )}

        {/* Nama Kategori */}
        <div>
          <label
            htmlFor="nama"
            className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2"
          >
            Nama Kategori
          </label>
          <input
            id="nama"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Gaji, Makanan"
            minLength={3}
            maxLength={100}
            className={`w-full px-3 md:px-5 py-2 md:py-3 border rounded-lg shadow focus:outline-none transition text-sm md:text-base border-gray-200`}
          />
          {errors.nama && <FieldError message={errors.nama} className="pt-1" />}
        </div>

        {/* Tipe Kategori */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-800 mb-1 md:mb-2">
            Tipe Kategori
          </span>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTipe("income")}
              className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow border text-xs sm:text-sm font-medium transition ${
                tipe === "income"
                  ? "bg-secondary border-secondary/50 text-gray-50 font-semibold"
                  : "border-gray-200 text-gray-600 hover:bg-secondary/15"
              }`}
            >
              <FaCheckCircle
                className={`absolute hidden sm:block left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-opacity ${
                  tipe === "income" ? "opacity-100" : "opacity-0"
                }`}
              />
              <FaArrowTrendUp className="text-xs sm:text-base" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setTipe("expense")}
              className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow border text-xs sm:text-sm font-medium transition ${
                tipe === "expense"
                  ? "bg-secondary border-secondary/50 text-gray-50 font-semibold"
                  : "border-gray-200 text-gray-600 hover:bg-secondary/15"
              }`}
            >
              <FaCheckCircle
                className={`absolute hidden sm:block left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-opacity ${
                  tipe === "expense" ? "opacity-100" : "opacity-0"
                }`}
              />
              <FaArrowTrendDown className="text-xs sm:text-base" />
              Pengeluaran
            </button>
          </div>
          {errors.tipe && <FieldError message={errors.tipe} className="pt-1" />}
        </div>

        {/* Deskripsi */}
        <div>
          <label
            htmlFor="deskripsi"
            className="block text-xs md:text-sm font-medium text-gray-800 mb-1 md:mb-2"
          >
            Deskripsi{" "}
            <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi singkat kategori..."
            maxLength={300}
            rows={4}
            className={`w-full px-3 md:px-5 py-2 md:py-3 border rounded-lg shadow focus:outline-none transition resize-none text-sm md:text-base ${
              errors.deskripsi ? "border-red-300" : "border-gray-200"
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.deskripsi ? (
              <FieldError message={errors.deskripsi} className="pt-0" />
            ) : (
              <p className="text-xs text-gray-600">
                Maksimal 300 karakter (opsional)
              </p>
            )}
            <span className="text-xs text-gray-400">
              {deskripsi.length}/300
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="px-4 sm:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition border border-gray-200 disabled:opacity-50 text-xs sm:text-sm"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 sm:px-6 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-medium transition shadow disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            {isPending ? (
              <>
                <Spinner className="text-white" />
                Menyimpan...
              </>
            ) : (
              <>
                <FaPlus />
                Tambah
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahKategoriPage;
