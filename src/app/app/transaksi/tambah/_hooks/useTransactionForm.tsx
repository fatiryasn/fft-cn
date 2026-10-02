"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { createTransaction } from "@/services/transaction.service";
import type { Purpose } from "@/lib/utils/transaction.util";
import {
  validateAll,
  validateDesktopStep,
  validateMobileStep,
  type Entry,
  type Errors,
} from "../_lib/validation";

import { MAX_IMAGES, MAX_IMAGE_SIZE } from "../_lib/constants";


export function useTransactionForm() {
  const router = useRouter();

  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [note, setNote] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [transactionTime, setTransactionTime] = useState("00:00");
  const [useSpecificTime, setUseSpecificTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isAccountPickerOpen, setIsAccountPickerOpen] = useState(false);
  const [accountPickerTargetIndex, setAccountPickerTargetIndex] = useState<
    number | null
  >(null);

  // inside useTransactionForm
  const [currentStep, setCurrentStep] = useState(0);
  const [desktopStep, setDesktopStep] = useState(0);

  // reset on purpose change
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
    setIsSubmitting(false);
  }, [purpose]);

  const ctx = {
    purpose,
    note,
    transactionDate,
    transactionTime,
    useSpecificTime,
    categoryId,
    entries,
  };

  // pickers
  const openCategoryPicker = () => setIsCategoryPickerOpen(true);
  const closeCategoryPicker = () => setIsCategoryPickerOpen(false);
  const handleCategorySelect = (id: string, name: string) => {
    setCategoryId(id);
    setCategoryName(name);
    closeCategoryPicker();
  };

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

  // entries
  const removeEntryRow = (index: number) =>
    setEntries((prev) => prev.filter((_, i) => i !== index));
  const updateEntryAmount = (index: number, value: string | undefined) =>
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], amount: value || "" };
      return updated;
    });

  // images
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
  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // step guards
  const checkDesktopStep = (step: number) => {
    const e = validateDesktopStep(ctx, step);
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const checkMobileStep = (step: number) => {
    const e = validateMobileStep(ctx, step);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // submit
  const submit = useCallback(async () => {
    const e = validateAll(ctx);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsSubmitting(true);
    const timePart = useSpecificTime ? transactionTime : "00:00";
    const combined = `${transactionDate}T${timePart}:00`;
    const result = await createTransaction({
      purpose: purpose!,
      category_id: categoryId || null,
      note: note.trim() || undefined,
      transaction_at: new Date(combined).toISOString(),
      entries: entries.map((en) => ({
        account_id: en.account_id,
        amount: parseFloat(en.amount),
      })),
      attachments: images.length > 0 ? images : undefined,
    });
    setIsSubmitting(false);

    if (result.error) {
      enqueueSnackbar(result.error, { variant: "error" });
    } else {
      enqueueSnackbar("Transaksi berhasil disimpan", { variant: "success" });
      router.push("/app/transaksi");
    }
  }, [
    purpose,
    categoryId,
    note,
    transactionDate,
    transactionTime,
    useSpecificTime,
    entries,
    images,
    router,
  ]);

  return {
    // data
    purpose,
    note,
    categoryId,
    categoryName,
    entries,
    images,
    errors,
    transactionDate,
    transactionTime,
    useSpecificTime,
    isSubmitting,
    // pickers
    isCategoryPickerOpen,
    isAccountPickerOpen,
    // setters
    setPurpose,
    setNote,
    setTransactionDate,
    setTransactionTime,
    setUseSpecificTime,
    // actions
    openCategoryPicker,
    closeCategoryPicker,
    handleCategorySelect,
    openAccountPicker,
    closeAccountPicker,
    handleAccountSelect,
    removeEntryRow,
    updateEntryAmount,
    handleImageAdd,
    removeImage,
    checkDesktopStep,
    checkMobileStep,
    submit,
    currentStep,
    desktopStep,
    setCurrentStep,
    setDesktopStep,
  };
}

export type TransactionForm = ReturnType<typeof useTransactionForm>;