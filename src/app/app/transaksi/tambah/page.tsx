"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CurrencyInput from "react-currency-input-field";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSearch,
  FaChevronRight,
  FaChevronLeft,
  FaCheckCircle,
  FaExchangeAlt,
} from "react-icons/fa";
import { enqueueSnackbar } from "notistack";
import { createTransaction } from "@/services/transaction.service";
import { FaArrowTrendDown, FaArrowTrendUp, FaX } from "react-icons/fa6";
import { Purpose, purposeOptions } from "@/lib/utils/transaction.util";
import { getAccountTypeBadge } from "@/lib/utils/account.util";
import AccountPicker from "@/components/shared/AccountPicker";
import CategoryPicker from "@/components/shared/CategoryPicker";
import FieldError from "@/components/shared/FieldError";
import Spinner from "@/components/shared/Spinner"; // imported for loading state

//CONSTANTS
const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 500 * 1024;

const Page = () => {
  const router = useRouter();

  //STATES
  const [currentStep, setCurrentStep] = useState(0);
  const [desktopStep, setDesktopStep] = useState(0);

  //form
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [entries, setEntries] = useState<
    {
      account_id: string;
      account_name: string;
      amount: string;
      account_type?: string;
    }[]
  >([]);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [transactionTime, setTransactionTime] = useState("00:00");
  const [useSpecificTime, setUseSpecificTime] = useState(false);

  //submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  //picker popup states
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
  const [accountPickerTargetIndex, setAccountPickerTargetIndex] = useState<
    number | null
  >(null);

  //reset form
  useEffect(() => {
    setNote("");
    setCategoryId(null);
    setCategoryName("");
    setEntries([]);
    setImages([]);
    setErrors({});
    setCurrentStep(0);
    setDesktopStep(0);

    setTransactionDate(new Date().toISOString().slice(0, 10));
    setTransactionTime("00:00");
    setUseSpecificTime(false);
    setIsSubmitting(false); // reset submitting state if form reset
  }, [purpose]);

  // Category picker handlers
  const openCategoryPicker = () => setIsCategoryPickerOpen(true);
  const closeCategoryPicker = () => setIsCategoryPickerOpen(false);
  const handleCategorySelect = (id: string, name: string) => {
    setCategoryId(id);
    setCategoryName(name);
    closeCategoryPicker();
  };

  // Account picker handlers
  const openAccountPicker = (index: number | null) => {
    setAccountPickerTargetIndex(index);
    setIsAccountPickerOpen(true);
  };
  const closeAccountPicker = () => setIsAccountPickerOpen(false);
  const handleAccountSelect = (id: string, name: string, type: string) => {
    if (accountPickerTargetIndex !== null) {
      setEntries((prev) => {
        const updated = [...prev];
        updated[accountPickerTargetIndex] = {
          ...updated[accountPickerTargetIndex],
          account_id: id,
          account_name: name,
          account_type: type,
        };
        return updated;
      });
    } else {
      setEntries((prev) => [
        ...prev,
        { account_id: id, account_name: name, amount: "", account_type: type },
      ]);
    }
    closeAccountPicker();
  };

  //ENTRY ROW
  const removeEntryRow = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };
  const updateEntryAmount = (index: number, value: string | undefined) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: value || "" };
      return updated;
    });
  };

  //IMAGE HANDLING
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files);
    if (images.length + newImages.length > MAX_IMAGES) {
      enqueueSnackbar(`Maksimal ${MAX_IMAGES} gambar`, { variant: "warning" });
      return;
    }
    const valid = newImages.filter((f) => {
      if (!f.type.startsWith("image/")) {
        enqueueSnackbar(`${f.name} bukan file gambar`, { variant: "error" });
        return false;
      }
      if (f.size > MAX_IMAGE_SIZE) {
        enqueueSnackbar(`${f.name} melebihi 500KB`, { variant: "error" });
        return false;
      }
      return true;
    });
    setImages((prev) => [...prev, ...valid]);
    e.target.value = "";
  };
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  //VALIDATION (full)
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!purpose) newErrors.purpose = "Pilih tipe";
    if (purpose !== "account_transfer") {
      if (!note.trim()) newErrors.note = "Keterangan wajib diisi";
      if (!transactionDate) newErrors.transactionDate = "Tanggal wajib diisi";
      if (useSpecificTime && !transactionTime)
        newErrors.transactionTime = "Waktu wajib diisi";
      if (!categoryId) newErrors.category = "Pilih kategori";
      if (entries.length === 0) newErrors.entries = "Minimal satu akun";
      entries.forEach((entry, i) => {
        if (!entry.account_id) newErrors[`account_${i}`] = "Pilih akun";
        if (!entry.amount || parseFloat(entry.amount) <= 0)
          newErrors[`amount_${i}`] = "Nominal harus > 0";
      });
    } else {
      if (entries.length !== 2)
        newErrors.entries = "Harus ada akun sumber & tujuan";
      entries.forEach((entry, i) => {
        if (!entry.account_id) newErrors[`account_${i}`] = "Pilih akun";
        if (!entry.amount || parseFloat(entry.amount) <= 0)
          newErrors[`amount_${i}`] = "Nominal harus > 0";
      });
      if (!note.trim() && purpose === "account_transfer")
        newErrors.note = "Keterangan wajib diisi";
      if (!transactionDate) newErrors.transactionDate = "Tanggal wajib diisi";
      if (useSpecificTime && !transactionTime)
        newErrors.transactionTime = "Waktu wajib diisi";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  //DESKTOP STEP VALIDATION
  const validateDesktopStep = (step: number): boolean => {
    if (!purpose) return false;
    if (step === 1) {
      const newErrors: Record<string, string> = {};
      if (purpose !== "account_transfer") {
        if (!note.trim()) newErrors.note = "Keterangan wajib diisi";
        if (!transactionDate) newErrors.transactionDate = "Tanggal wajib diisi";
        if (useSpecificTime && !transactionTime)
          newErrors.transactionTime = "Waktu wajib diisi";
        if (!categoryId) newErrors.category = "Pilih kategori";
        if (entries.length === 0) newErrors.entries = "Minimal satu akun";
        entries.forEach((entry, i) => {
          if (!entry.account_id) newErrors[`account_${i}`] = "Pilih akun";
          if (!entry.amount || parseFloat(entry.amount) <= 0)
            newErrors[`amount_${i}`] = "Nominal harus > 0";
        });
      } else {
        if (entries.length !== 2)
          newErrors.entries = "Harus ada akun sumber & tujuan";
        entries.forEach((entry, i) => {
          if (!entry.account_id) newErrors[`account_${i}`] = "Pilih akun";
          if (!entry.amount || parseFloat(entry.amount) <= 0)
            newErrors[`amount_${i}`] = "Nominal harus > 0";
        });
        if (!note.trim()) newErrors.note = "Keterangan wajib diisi";
        if (!transactionDate) newErrors.transactionDate = "Tanggal wajib diisi";
        if (useSpecificTime && !transactionTime)
          newErrors.transactionTime = "Waktu wajib diisi";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  };
  //MOBILE STEP VALIDATION
  const validateMobileStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!purpose) newErrors.purpose = "Pilih salah satu tipe";
    } else if (step === 1) {
      if (purpose !== "account_transfer") {
        if (!note.trim()) newErrors.note = "Keterangan wajib diisi";
        if (!transactionDate) newErrors.transactionDate = "Tanggal wajib diisi";
        if (useSpecificTime && !transactionTime)
          newErrors.transactionTime = "Waktu wajib diisi";
        if (!categoryId) newErrors.category = "Pilih kategori";
      } else {
        if (!entries[0]?.account_id) newErrors.account_0 = "Pilih akun";
        if (!entries[0]?.amount || parseFloat(entries[0].amount) <= 0)
          newErrors.amount_0 = "Nominal harus > 0";
      }
    } else if (step === 2) {
      if (purpose !== "account_transfer") {
        if (entries.length === 0) newErrors.entries = "Minimal satu akun";
        entries.forEach((entry, i) => {
          if (!entry.account_id) newErrors[`account_${i}`] = "Pilih akun";
          if (!entry.amount || parseFloat(entry.amount) <= 0)
            newErrors[`amount_${i}`] = "Nominal harus > 0";
        });
      } else {
        if (!entries[1]?.account_id) newErrors.account_1 = "Pilih akun";
        if (!entries[1]?.amount || parseFloat(entries[1].amount) <= 0)
          newErrors.amount_1 = "Nominal harus > 0";
      }
    } else if (step === 3) {
      if (purpose === "account_transfer") {
        if (!note.trim()) newErrors.note = "Keterangan wajib diisi";
        if (!transactionDate) newErrors.transactionDate = "Tanggal wajib diisi";
        if (useSpecificTime && !transactionTime)
          newErrors.transactionTime = "Waktu wajib diisi";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //MOBILE NEXT HANDLER
  const handleNextMobile = () => {
    if (validateMobileStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      enqueueSnackbar("Lengkapi field yang wajib", {
        variant: "warning",
      });
    }
  };

  //SUBMIT
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const timePart = useSpecificTime ? transactionTime : "00:00";
    const combinedDateTime = `${transactionDate}T${timePart}:00`;
    const transaction_at = new Date(combinedDateTime).toISOString();
    const data = {
      purpose: purpose!,
      category_id: categoryId || null,
      note: note.trim() || undefined,
      transaction_at: transaction_at,
      entries: entries.map((e) => ({
        account_id: e.account_id,
        amount: parseFloat(e.amount),
      })),
      attachments: images.length > 0 ? images : undefined,
    };
    const result = await createTransaction(data);
    setIsSubmitting(false);
    if (result.error) {
      enqueueSnackbar(result.error, { variant: "error" });
    } else {
      enqueueSnackbar("Transaksi berhasil disimpan", { variant: "success" });
      router.push("/app/transaksi");
    }
  };

  //FORM STEPS
  const stepComponents = [
    /* step 0 */
    <div key="step0" className="space-y-4">
      <h3 className="md:text-lg font-semibold text-gray-800">
        Pilih Tipe Transaksi
      </h3>

      <div className="space-y-2">
        {errors.purpose && <FieldError message={errors.purpose} />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {purposeOptions.map((opt) => {
            const isSelected = purpose === opt.value;
            const iconMap: Record<Purpose, React.ReactNode> = {
              income: <FaArrowTrendUp className="w-6 h-6 text-green-600" />,
              expense: <FaArrowTrendDown className="w-6 h-6 text-red-600" />,
              account_transfer: (
                <FaExchangeAlt className="w-6 h-6 text-blue-600" />
              ),
            };
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPurpose(opt.value)}
                disabled={isSubmitting} // disable while submitting
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition h-32 md:h-48 ${
                  isSelected
                    ? "border-secondary bg-secondary/5 text-secondary"
                    : "border-gray-200 hover:border-gray-300"
                } ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="mb-2">{iconMap[opt.value]}</div>
                <span
                  className={`text-sm md:text-base font-semibold font-poppins ${
                    isSelected ? "text-secondary" : "text-gray-800"
                  }`}
                >
                  {opt.label}
                </span>
                <p className="text-xs md:text-sm text-gray-600 mt-1 text-center leading-tight">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>,

    /* step 1 */
    <div key="step1" className="space-y-4">
      {/* income/expense */}
      {purpose !== "account_transfer" ? (
        <>
          <h3 className="md:text-lg font-semibold">
            Detail Transaksi{" "}
            {purpose === "income"
              ? "Pemasukan"
              : purpose === "expense"
                ? "Pengeluaran"
                : ""}
          </h3>
          {/* note */}
          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={2}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
              placeholder="Deskripsi transaksi..."
            />
            {errors.note && <FieldError message={errors.note} />}
          </div>
          {/* date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
            />
            {errors.transactionDate && (
              <FieldError message={errors.transactionDate} />
            )}
          </div>

          {/* time */}
          <div>
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={useSpecificTime}
                onChange={(e) => setUseSpecificTime(e.target.checked)}
                disabled={isSubmitting}
                className="rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              Gunakan jam spesifik
            </label>
            {useSpecificTime && (
              <input
                type="time"
                value={transactionTime}
                onChange={(e) => setTransactionTime(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
              />
            )}
          </div>
          {/* category */}
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <button
              type="button"
              onClick={openCategoryPicker}
              disabled={isSubmitting}
              className="w-full text-left px-4 py-2 border border-gray-200 shadow rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center text-sm md:text-base"
            >
              <span
                className={categoryName ? "text-gray-900" : "text-gray-400"}
              >
                {categoryName || "Pilih kategori..."}
              </span>
              <FaSearch className="text-gray-400" />
            </button>
            {errors.category && (
              <FieldError message={errors.category} className="pt-1" />
            )}
          </div>
        </>
      ) : (
        <>
          {/* relocation */}
          <h3 className="md:text-lg font-semibold">Akun Sumber & Nominal</h3>
          {/* source account */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Akun Sumber
            </label>
            <button
              type="button"
              onClick={() => openAccountPicker(0)}
              disabled={isSubmitting}
              className="w-full text-left px-4 py-2 border border-gray-200 shadow rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center text-sm md:text-base"
            >
              <span
                className={
                  entries[0]?.account_name ? "text-gray-900" : "text-gray-400"
                }
              >
                {entries[0]?.account_name || "Pilih akun..."}
              </span>
              <FaSearch className="text-gray-400" />
            </button>
            {errors.account_0 && (
              <FieldError message={errors.account_0} className="pt-1" />
            )}
          </div>
          {/* nominal */}
          <div>
            <label className="block text-sm font-medium mb-1">Nominal</label>
            <CurrencyInput
              value={entries[0]?.amount}
              onValueChange={(value) => updateEntryAmount(0, value)}
              placeholder="Rp 0"
              prefix="Rp "
              groupSeparator="."
              decimalSeparator=","
              decimalsLimit={2}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
            />
            {errors.amount_0 && (
              <FieldError message={errors.amount_0} className="pt-1" />
            )}
          </div>
        </>
      )}
    </div>,

    /* step 2 */
    <div key="step2" className="space-y-4">
      {/* income/expense */}
      {purpose !== "account_transfer" ? (
        <>
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="flex items-center gap-1 text-secondary font-medium text-sm md:text-base"
          >
            <FaPlus /> Tambah Akun
          </button>
        </>
      ) : (
        <>
          <h3 className="md:text-lg font-semibold">Akun Tujuan & Nominal</h3>
          <div>
            <label className="block text-sm font-medium mb-1">
              Akun Tujuan
            </label>
            <button
              type="button"
              onClick={() => openAccountPicker(1)}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
            />
            {errors.amount_1 && (
              <FieldError message={errors.amount_1} className="pt-1" />
            )}
          </div>
        </>
      )}
    </div>,

    /* Step 3 */
    <div key="step3" className="space-y-4">
      {purpose !== "account_transfer" ? (
        <>
          <h3 className="md:text-lg font-semibold">
            Bukti Transaksi (Opsional)
          </h3>
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">Maks. 3 gambar, max 500KB</p>
        </>
      ) : (
        <>
          <h3 className="md:text-lg font-semibold">Keterangan & Bukti</h3>
          {/* note */}
          <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={2}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
            />
            {errors.note && <FieldError message={errors.note} />}
          </div>
          {/* date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
            />
            {errors.transactionDate && (
              <FieldError message={errors.transactionDate} />
            )}
          </div>

          {/* time */}
          <div>
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={useSpecificTime}
                onChange={(e) => setUseSpecificTime(e.target.checked)}
                disabled={isSubmitting}
                className="rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              Gunakan jam spesifik
            </label>
            {useSpecificTime && (
              <input
                type="time"
                value={transactionTime}
                onChange={(e) => setTransactionTime(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none"
              />
            )}
          </div>
          {/* evidences */}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">Maks. 3 gambar, max 500KB</p>
        </>
      )}
    </div>,

    /* step 4 */
    <div key="step4" className="space-y-6">
      <h3 className="md:text-lg font-semibold text-gray-800">
        Konfirmasi Transaksi
      </h3>

      {/* Tipe */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Tipe Transaksi</span>
        <span className="text-gray-900 font-medium font-lexend">
          {purposeOptions.find((o) => o.value === purpose)?.label || "-"}
        </span>
      </div>

      {/* Keterangan */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Keterangan</span>
        <span className="text-gray-900 font-medium font-lexend">
          {note || "-"}
        </span>
      </div>

      {/* Tanggal & Waktu */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Tanggal Transaksi</span>
        <span className="text-gray-900 font-medium font-lexend">
          {transactionDate} {useSpecificTime ? transactionTime : ""}
        </span>
      </div>

      {/* Kategori (only for income/expense) */}
      {purpose !== "account_transfer" && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-700">Kategori</span>
          <span className="text-gray-900 font-medium font-lexend">
            {categoryName || "Tanpa kategori"}
          </span>
        </div>
      )}

      {/* Akun & Nominal */}
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

      {/* Bukti Transaksi */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-700">Bukti Transaksi</span>
        <span className="text-gray-900 font-medium font-lexend">
          {images.length > 0 ? `${images.length} file terpilih` : "Tidak ada"}
        </span>
      </div>

      <p className="text-xs text-gray-600 text-center pt-2">
        Klik "Simpan" di bawah untuk menyelesaikan transaksi.
      </p>
    </div>,
  ];

  return (
    <div className="mx-auto space-y-6">
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block">
        {/* step indicator */}
        <div className="flex gap-2 mb-4">
          {["Tipe", "Detail", "Konfirmasi"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= desktopStep
                    ? "bg-secondary text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${i <= desktopStep ? "text-secondary font-medium" : "text-gray-400"}`}
              >
                {label}
              </span>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        {/* main content */}
        <div className="bg-surface border border-gray-200 shadow rounded-xl p-6">
          {desktopStep === 0 && stepComponents[0]}

          {desktopStep === 1 && (
            <div className="space-y-6">
              {stepComponents[1]}
              {stepComponents[2]}
              {stepComponents[3]}
            </div>
          )}

          {desktopStep === 2 && stepComponents[4]}
        </div>

        {/* navigation */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setDesktopStep((prev) => Math.max(0, prev - 1))}
            disabled={desktopStep === 0 || isSubmitting}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <FaChevronLeft /> Sebelumnya
          </button>
          {desktopStep < 2 ? (
            <button
              onClick={() => {
                if (desktopStep === 0 && !purpose) {
                  enqueueSnackbar("Pilih tipe transaksi", {
                    variant: "warning",
                  });
                  return;
                }
                if (desktopStep === 1 && !validateDesktopStep(1)) {
                  enqueueSnackbar("Lengkapi semua field yang wajib", {
                    variant: "warning",
                  });
                  return;
                }
                setDesktopStep((prev) => prev + 1);
              }}
              disabled={isSubmitting}
              className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              Berikutnya <FaChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-secondary text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="text-white" /> Menyimpan...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Simpan Transaksi
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden">
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: stepComponents.length }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === currentStep ? "bg-secondary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="bg-surface border border-gray-200 shadow rounded-xl p-6">
          {stepComponents[currentStep]}
        </div>

        {/* navigations */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0 || isSubmitting}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm md:text-base"
          >
            <FaChevronLeft /> Sebelumnya
          </button>
          {currentStep < stepComponents.length - 1 ? (
            <button
              onClick={handleNextMobile}
              disabled={isSubmitting}
              className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center gap-2 text-sm md:text-base disabled:opacity-50"
            >
              Berikutnya <FaChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-secondary text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="text-white" /> Menyimpan...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Simpan
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* PICKERS */}
      <CategoryPicker
        isOpen={isCategoryPickerOpen}
        onClose={closeCategoryPicker}
        purpose={purpose !== "account_transfer" ? purpose : null}
        onSelect={handleCategorySelect}
      />
      <AccountPicker
        isOpen={isAccountPickerOpen}
        onClose={closeAccountPicker}
        onSelect={handleAccountSelect}
      />
    </div>
  );
};

export default Page;
