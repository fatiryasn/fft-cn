"use client";

import { useState, useTransition } from "react";
import CurrencyInput from "react-currency-input-field";
import {
  FaCheckCircle,
  FaMoneyBillWave,
  FaPlus,
  FaWallet,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { createAccount } from "@/services/account.service";
import Spinner from "@/components/shared/Spinner";
import FieldError from "@/components/shared/FieldError";

const TambahAkunPage = () => {
  const router = useRouter();
  const [namaAkun, setNamaAkun] = useState("");
  const [tipeAkun, setTipeAkun] = useState<"cash" | "cashless" | null>(null);
  const [saldoAwal, setSaldoAwal] = useState<number | string>("0");
  const [errors, setErrors] = useState<{
    namaAkun?: string;
    tipeAkun?: string;
  }>({});
  const [isPending, startTransition] = useTransition();

  //clear
  const handleClear = () => {
    setNamaAkun("");
    setTipeAkun(null);
    setSaldoAwal("0");
    setErrors({});
  };

  //handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (
      !namaAkun.trim() ||
      namaAkun.trim().length < 3 ||
      namaAkun.trim().length > 100
    ) {
      newErrors.namaAkun = "Nama akun harus 3 - 100 karakter";
    }
    if (!tipeAkun) {
      newErrors.tipeAkun = "Pilih tipe akun";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      startTransition(async () => {
        const result = await createAccount({
          name: namaAkun.trim(),
          type: tipeAkun!,
          initial_balance:
            typeof saldoAwal === "string" ? parseFloat(saldoAwal) : saldoAwal,
        });

        if (result && result.error) {
          enqueueSnackbar(result.error, { variant: "error" });
          return;
        }

        enqueueSnackbar("Akun berhasil ditambahkan", { variant: "success" });
        router.push("/app/settings/akun-keuangan");
      });
    }
  };

  return (
    <div className="bg-surface shadow rounded-xl border border-gray-200 mx-auto">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {/* NAME */}
        <div>
          <label
            htmlFor="namaAkun"
            className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2"
          >
            Nama Akun
          </label>
          <input
            id="namaAkun"
            type="text"
            value={namaAkun}
            onChange={(e) => setNamaAkun(e.target.value)}
            placeholder="Contoh: Dompet"
            minLength={3}
            maxLength={100}
            className={`w-full px-3 md:px-5 py-2 md:py-3 border rounded-lg shadow focus:outline-none transition text-sm md:text-base border-gray-200`}
          />
          {errors.namaAkun && (
            <FieldError message={errors.namaAkun} className="pt-1" />
          )}
        </div>

        {/* TYPE */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-800 mb-1 md:mb-2">
            Tipe Akun
          </span>
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setTipeAkun("cash")}
              className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow border text-xs sm:text-sm font-medium transition ${
                tipeAkun === "cash"
                  ? "bg-secondary border-secondary/50 text-gray-50 font-semibold"
                  : "border-gray-200 text-gray-600 hover:bg-secondary/15"
              }`}
            >
              <FaCheckCircle
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-opacity ${
                  tipeAkun === "cash" ? "opacity-100" : "opacity-0"
                }`}
              />
              <FaMoneyBillWave className="text-xs sm:text-base" />
              Cash
            </button>
            <button
              type="button"
              onClick={() => setTipeAkun("cashless")}
              className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow border text-xs sm:text-sm font-medium transition ${
                tipeAkun === "cashless"
                  ? "bg-secondary border-secondary/50 text-gray-50 font-semibold"
                  : "border-gray-200 text-gray-600 hover:bg-secondary/15"
              }`}
            >
              <FaCheckCircle
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-opacity ${
                  tipeAkun === "cashless" ? "opacity-100" : "opacity-0"
                }`}
              />
              <FaWallet className="text-xs sm:text-base" />
              Cashless
            </button>
          </div>
          {errors.tipeAkun && (
            <FieldError message={errors.tipeAkun} className="pt-1" />
          )}
        </div>

        {/* INIT BALANCE */}
        <div>
          <label
            htmlFor="saldoAwal"
            className="block text-xs md:text-sm font-medium text-gray-800 mb-1 md:mb-2"
          >
            Saldo Awal
          </label>
          <CurrencyInput
            id="saldoAwal"
            name="saldoAwal"
            placeholder="Rp 0,00"
            value={saldoAwal}
            decimalsLimit={2}
            decimalSeparator=","
            groupSeparator="."
            allowNegativeValue={true}
            prefix="Rp "
            onValueChange={(value) => {
              setSaldoAwal(value || "0");
            }}
            className="w-full px-3 md:px-5 py-2 md:py-3 border border-gray-200 rounded-lg shadow focus:outline-none transition text-sm md:text-base"
          />
          <p className="mt-1 text-xs text-gray-600">
            Masukkan saldo awal akun (bisa negatif atau nol)
          </p>
        </div>

        {/* BUTTONS */}
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

export default TambahAkunPage;
