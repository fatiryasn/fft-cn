"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { enqueueSnackbar } from "notistack";

import { createRecommendedCategories } from "@/services/category.service";
import Spinner from "@/components/shared/Spinner";

interface Props {
  hasAnyCategory: boolean;
  onPendingChange?: (isPending: boolean) => void;
  redirectTo?: string;
}

export function RecommendedCategoriesCard({
  hasAnyCategory,
  onPendingChange,
  redirectTo,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  if (hasAnyCategory) return null;

  const handleClick = () => {
    startTransition(async () => {
      const result = await createRecommendedCategories();

      if ("error" in result) {
        enqueueSnackbar(result.error, { variant: "error" });
        router.refresh();
        return;
      }

      enqueueSnackbar(`${result.created} kategori berhasil ditambahkan`, {
        variant: "success",
      });

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-3 p-4 rounded-xl border border-secondary/30 bg-secondary/5">
      <FaWandMagicSparkles className="text-secondary mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm lg:text-base font-semibold text-secondary">
          Mulai cepat dengan kategori rekomendasi
        </p>
        <p className="text-xs lg:text-sm text-gray-700 mt-1 leading-relaxed">
          Tambahkan 15 kategori umum (6 pemasukan + 9 pengeluaran) sekaligus,
          supaya kamu bisa langsung mulai transaksi.
        </p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="px-4 py-2 bg-secondary text-white rounded-lg text-xs lg:text-sm font-semibold hover:bg-secondary/90 shrink-0 flex items-center gap-1 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Spinner className="text-white" /> Menambahkan...
          </>
        ) : (
          <>
            <FaWandMagicSparkles /> Tambahkan Rekomendasi
          </>
        )}
      </button>
    </div>
  );
}
