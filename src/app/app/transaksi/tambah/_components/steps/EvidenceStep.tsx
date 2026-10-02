"use client";

import { FaPlus, FaTrash } from "react-icons/fa";

import FieldError from "@/components/shared/FieldError";
import { MAX_IMAGES } from "../../_lib/constants";
import type { TransactionForm } from "../../_hooks/useTransactionForm";

interface Props {
  form: TransactionForm;
  disabled: boolean;
}

export function EvidenceStep({ form, disabled }: Props) {
  const {
    purpose,
    note,
    images,
    errors,
    transactionDate,
    transactionTime,
    useSpecificTime,
    setNote,
    setTransactionDate,
    setTransactionTime,
    setUseSpecificTime,
    handleImageAdd,
    removeImage,
  } = form;

  const imageGrid = (
    <>
      <div className="flex gap-2 flex-wrap">
        {images.map((file, idx) => (
          <div
            key={idx}
            className="relative w-20 h-32 bg-gray-100 rounded-lg overflow-hidden"
          >
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              disabled={disabled}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl"
            >
              <FaTrash size={10} />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <label className="w-20 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <FaPlus className="text-gray-400" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageAdd}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-xs text-gray-500">Maks. 3 gambar, max 500KB</p>
    </>
  );

  if (purpose !== "account_transfer") {
    return (
      <div className="space-y-4">
        <h3 className="md:text-lg font-semibold">Bukti Transaksi (Opsional)</h3>
        {imageGrid}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="md:text-lg font-semibold">Keterangan & Bukti</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Keterangan</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          rows={2}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
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
            className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none"
          />
        )}
      </div>

      {imageGrid}
    </div>
  );
}
