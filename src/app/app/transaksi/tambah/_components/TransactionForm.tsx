"use client";

import { FaChevronRight, FaChevronLeft, FaCheckCircle } from "react-icons/fa";
import { enqueueSnackbar } from "notistack";

import AccountPicker from "@/components/shared/AccountPicker";
import CategoryPicker from "@/components/shared/CategoryPicker";
import Spinner from "@/components/shared/Spinner";

import { useTransactionForm } from "../_hooks/useTransactionForm";
import { ResourceWarnings } from "./ResourceWarnings";
import { TypeStep } from "./steps/TypeStep";
import { DetailStep } from "./steps/DetailStep";
import { EntriesStep } from "./steps/EntriesStep";
import { EvidenceStep } from "./steps/EvidenceStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";

interface Props {
  accountCount: number;
  incomeCategoryCount: number;
  expenseCategoryCount: number;
}

const DESKTOP_STEPS = [
  { label: "Tipe" },
  { label: "Detail" },
  { label: "Konfirmasi" },
] as const;

const MOBILE_STEPS = [
  { label: "Tipe" },
  { label: "Detail" },
  { label: "Akun" },
  { label: "Bukti" },
  { label: "Konfirmasi" },
] as const;

export default function TransactionForm({
  accountCount,
  incomeCategoryCount,
  expenseCategoryCount,
}: Props) {
  const form = useTransactionForm();
  const {
    purpose,
    isSubmitting,
    currentStep,
    desktopStep,
    setCurrentStep,
    setDesktopStep,
    isCategoryPickerOpen,
    isAccountPickerOpen,
    closeCategoryPicker,
    handleCategorySelect,
    closeAccountPicker,
    handleAccountSelect,
    checkDesktopStep,
    checkMobileStep,
    submit,
  } = form;

  const isBlocked =
    accountCount === 0 ||
    incomeCategoryCount === 0 ||
    expenseCategoryCount === 0;
  const formDisabled = isSubmitting || isBlocked;

  const handleNextDesktop = () => {
    if (desktopStep === 0 && !purpose) {
      enqueueSnackbar("Pilih tipe transaksi", { variant: "warning" });
      return;
    }
    if (desktopStep === 1 && !checkDesktopStep(1)) {
      enqueueSnackbar("Lengkapi semua field yang wajib", {
        variant: "warning",
      });
      return;
    }
    setDesktopStep((prev) => prev + 1);
  };

  const handleNextMobile = () => {
    if (checkMobileStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else {
      enqueueSnackbar("Lengkapi field yang wajib", { variant: "warning" });
    }
  };

  const handleSubmit = async () => {
    if (isBlocked) {
      enqueueSnackbar("Lengkapi akun & kategori terlebih dahulu", {
        variant: "warning",
      });
      return;
    }
    await submit();
  };

  return (
    <div className="mx-auto space-y-6">
      {/* RESOURCE WARNING */}
      <ResourceWarnings
        accountCount={accountCount}
        incomeCategoryCount={incomeCategoryCount}
        expenseCategoryCount={expenseCategoryCount}
      />

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block">
        {/* step indicator */}
        <div className="flex gap-2 mb-4">
          {DESKTOP_STEPS.map((step, i) => (
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
                className={`text-sm ${
                  i <= desktopStep
                    ? "text-secondary font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {i < DESKTOP_STEPS.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* main content */}
        <div className="bg-surface border border-gray-200 shadow rounded-xl p-6">
          {desktopStep === 0 && (
            <TypeStep
              form={form}
              disabled={formDisabled}
              accountCount={accountCount}
            />
          )}
          {desktopStep === 1 && (
            <div className="space-y-6">
              <DetailStep form={form} disabled={formDisabled} />
              <EntriesStep form={form} disabled={formDisabled} />
              <EvidenceStep form={form} disabled={formDisabled} />
            </div>
          )}
          {desktopStep === 2 && <ConfirmationStep form={form} />}
        </div>

        {/* navigation */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setDesktopStep((prev) => Math.max(0, prev - 1))}
            disabled={desktopStep === 0 || formDisabled}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <FaChevronLeft /> Sebelumnya
          </button>
          {desktopStep < DESKTOP_STEPS.length - 1 ? (
            <button
              onClick={handleNextDesktop}
              disabled={formDisabled}
              className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              Berikutnya <FaChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={formDisabled}
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
        {/* step indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {MOBILE_STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;

            if (isActive) {
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-secondary text-white transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                disabled={formDisabled || i > currentStep}
                aria-label={`Langkah ${i + 1}: ${step.label}`}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isDone
                    ? "bg-secondary text-white cursor-pointer"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                } disabled:opacity-100`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="bg-surface border border-gray-200 shadow rounded-xl p-6">
          {currentStep === 0 && (
            <TypeStep
              form={form}
              disabled={formDisabled}
              accountCount={accountCount}
            />
          )}
          {currentStep === 1 && (
            <DetailStep form={form} disabled={formDisabled} />
          )}
          {currentStep === 2 && (
            <EntriesStep form={form} disabled={formDisabled} />
          )}
          {currentStep === 3 && (
            <EvidenceStep form={form} disabled={formDisabled} />
          )}
          {currentStep === 4 && <ConfirmationStep form={form} />}
        </div>

        {/* navigation */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0 || formDisabled}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm md:text-base"
          >
            <FaChevronLeft /> Sebelumnya
          </button>
          {currentStep < MOBILE_STEPS.length - 1 ? (
            <button
              onClick={handleNextMobile}
              disabled={formDisabled}
              className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center gap-2 text-sm md:text-base disabled:opacity-50"
            >
              Berikutnya <FaChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={formDisabled}
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
}
