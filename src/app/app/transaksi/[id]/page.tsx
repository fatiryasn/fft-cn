"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaEdit, FaTrashAlt, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { enqueueSnackbar } from "notistack";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction.service";
import Spinner from "@/components/shared/Spinner";
import {
  buildISOString,
  formatDate,
  formatRupiah,
  parseLocalDateTime,
} from "@/lib/utils/common.util";
import { useTitle } from "@/context/TitleContext";
import { getAccountTypeBadge } from "@/lib/utils/account.util";
import { getTransactionPurposeBadge } from "@/lib/utils/transaction.util";
import CategoryPicker from "@/components/shared/CategoryPicker";
import LoadingState from "@/components/shared/LoadingState";
import FieldError from "@/components/shared/FieldError";

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setTitle } = useTitle();

  // ── Transaction data ──────────────────────────────────
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Edit mode ─────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [formNote, setFormNote] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("00:00");
  const [formUseSpecificTime, setFormUseSpecificTime] = useState(false);
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
  const [formCategoryName, setFormCategoryName] = useState("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  // ── Category picker (only state needed) ───────────────
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);

  // ── Fullscreen image overlay ──────────────────────────
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const totalAmount =
    transaction?.transaction_entries?.reduce(
      (sum: number, e: any) => sum + e.signed_amount,
      0,
    ) || 0;

  // ── Detect changes ────────────────────────────────────
  const hasChanges = useCallback(() => {
    if (!transaction) return false;
    const originalDate = transaction.transaction_at
      ? parseLocalDateTime(transaction.transaction_at)
      : { date: "", time: "" };
    const originalTime = originalDate.time === "00:00" ? "" : originalDate.time;
    const currentTime = formUseSpecificTime ? formTime : "";
    return (
      formNote !== (transaction.note || "") ||
      formDate !== originalDate.date ||
      currentTime !== originalTime ||
      formCategoryId !== transaction.category_id
    );
  }, [
    formNote,
    formDate,
    formTime,
    formUseSpecificTime,
    formCategoryId,
    transaction,
  ]);

  //FETCH TRANSACTIONS
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getTransactionById(id);
      if ("error" in result) {
        setFetchError(result.error || "Terjadi Kesalahan");
      } else {
        const tx = result.transaction;
        setTransaction(tx);

        setFormNote(tx.note || "");
        if (tx.transaction_at) {
          const { date, time } = parseLocalDateTime(tx.transaction_at);
          setFormDate(date);
          setFormTime(time);
          setFormUseSpecificTime(time !== "00:00");
        } else {
          const now = new Date();
          setFormDate(now.toISOString().slice(0, 10));
          setFormTime("00:00");
          setFormUseSpecificTime(false);
        }

        setFormCategoryId(tx.category_id);
        const categoryName =
          Array.isArray(tx.categories) && tx.categories.length > 0
            ? tx.categories[0]?.name || ""
            : "";
        setFormCategoryName(categoryName);

        setTitle(`Transaksi | ${tx.code}`);
      }
      setLoading(false);
    };
    fetchData();

    return () => {
      setTitle("Transaksi");
    };
  }, [id, setTitle]);

  //EDIT MODE HANDLERS
  const handleEdit = () => {
    if (!transaction) return;
    if (transaction.transaction_at) {
      const { date, time } = parseLocalDateTime(transaction.transaction_at);
      setFormDate(date);
      setFormTime(time);
      setFormUseSpecificTime(time !== "00:00");
    }
    setFormNote(transaction.note || "");
    setFormCategoryId(transaction.category_id);
    const categoryName =
      Array.isArray(transaction.categories) && transaction.categories.length > 0
        ? transaction.categories[0]?.name || ""
        : transaction.categories?.name || "";
    setFormCategoryName(categoryName);
    setEditErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditErrors({});
    if (transaction) {
      const { date, time } = parseLocalDateTime(
        transaction.transaction_at || "",
      );
      setFormDate(date);
      setFormTime(time);
      setFormUseSpecificTime(time !== "00:00");
      setFormNote(transaction.note || "");
      setFormCategoryId(transaction.category_id);
      const categoryName =
        Array.isArray(transaction.categories) &&
        transaction.categories.length > 0
          ? transaction.categories[0]?.name || ""
          : transaction.categories?.name || "";
      setFormCategoryName(categoryName);
    }
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!formNote.trim()) newErrors.note = "Keterangan wajib diisi";
    if (!formDate) newErrors.date = "Tanggal wajib diisi";
    if (formUseSpecificTime && !formTime) newErrors.time = "Waktu wajib diisi";
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const isoString = buildISOString(
      formDate,
      formUseSpecificTime ? formTime : "00:00",
    );

    startSaving(async () => {
      const result = await updateTransaction(id, {
        note: formNote,
        transaction_at: isoString,
        category_id: formCategoryId || null,
      });

      if (result.error) {
        enqueueSnackbar(result.error, { variant: "error" });
        return;
      }

      enqueueSnackbar("Transaksi berhasil diperbarui", { variant: "success" });
      setTransaction((prev: any) => ({
        ...prev,
        note: formNote,
        transaction_at: isoString,
        category_id: formCategoryId,
        categories: formCategoryId ? { name: formCategoryName } : null,
        updated_at: new Date().toISOString(),
      }));
      setIsEditing(false);
    });
  };

  //CATEGORY PICKER
  const openCategoryPopup = () => {
    if (!transaction || transaction.purpose === "account_transfer") return;
    setShowCategoryPopup(true);
  };
  const closeCategoryPopup = () => setShowCategoryPopup(false);
  const selectCategory = (id: string, name: string) => {
    setFormCategoryId(id);
    setFormCategoryName(name);
    closeCategoryPopup();
  };

  //DELETE HANDLER
  const handleDelete = () => {
    Swal.fire({
      title: "Hapus transaksi?",
      text: "Seluruh data transaksi termasuk bukti akan dihapus. Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startDeleting(async () => {
          const res = await deleteTransaction(id);
          if (res.error) {
            enqueueSnackbar(res.error, { variant: "error" });
            return;
          }
          enqueueSnackbar("Transaksi berhasil dihapus", { variant: "success" });
          router.push("/app/transaksi");
        });
      }
    });
  };

  //RENDER
  if (loading) {
    return <LoadingState />;
  }

  if (fetchError || !transaction) {
    return (
      <div className="text-center py-20 text-red-500">
        {fetchError || "Transaksi tidak ditemukan."}
        <br />
        <button
          onClick={() => router.back()}
          className="mt-4 text-blue-600 underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      {/* BASIC INFO */}
      <div className="bg-surface border border-gray-200 shadow rounded-xl p-6 space-y-6">
        <h3 className="md:text-lg font-semibold text-gray-800">Info Dasar</h3>

        {/* kode */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Kode Transaksi
          </span>
          <p className="md:text-lg font-bold text-gray-900 font-lexend">
            {transaction.code}
          </p>
        </div>

        {/* keterangan */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Keterangan
          </label>
          {isEditing ? (
            <>
              <textarea
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                maxLength={300}
                rows={2}
                className={`w-full px-3 py-2 border shadow rounded-lg focus:outline-none text-sm md:text-base
                border-gray-200
                `}
              />
              {editErrors.note && <FieldError message={editErrors.note} />}
            </>
          ) : (
            <p className="text-sm md:text-base text-gray-900 font-lexend">
              {transaction.note || "-"}
            </p>
          )}
        </div>

        {/* date time */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Tanggal & Waktu
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none text-sm md:text-base"
              />
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formUseSpecificTime}
                  onChange={(e) => setFormUseSpecificTime(e.target.checked)}
                  className="rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                Gunakan jam spesifik
              </label>
              {formUseSpecificTime && (
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 shadow rounded-lg focus:outline-none  text-sm md:text-base"
                />
              )}
              {editErrors.date && <FieldError message={editErrors.date} />}
              {editErrors.time && <FieldError message={editErrors.time} />}
            </div>
          ) : (
            <p className="text-sm md:text-base text-gray-900 font-lexend">
              {formatDate(transaction.transaction_at)}
            </p>
          )}
        </div>

        {/* tipe */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Tipe Transaksi
          </span>
          {getTransactionPurposeBadge(
            transaction.purpose,
            "text-xs md:text-sm",
          )}
        </div>

        {/* jumlah */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Total
          </span>
          <p
            className={`text-sm md:text-base font-bold font-lexend ${
              totalAmount >= 0 ? "text-green-700" : "text-red-700"
            }`}
          >
            {formatRupiah(Math.abs(totalAmount))}
          </p>
        </div>

        {/* kategori */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          {isEditing && transaction.purpose !== "account_transfer" ? (
            <>
              <button
                type="button"
                onClick={openCategoryPopup}
                className="w-full text-left px-4 py-2 border border-gray-200 shadow rounded-lg bg-white hover:bg-gray-50 flex justify-between items-center text-sm md:text-base"
              >
                <span
                  className={
                    formCategoryName ? "text-gray-900" : "text-gray-400"
                  }
                >
                  {formCategoryName || "Pilih kategori..."}
                </span>
                <FaSearch className="text-gray-400" />
              </button>
              {editErrors.category && (
                <FieldError message={editErrors.category} className="pt-1" />
              )}
            </>
          ) : (
            <p className="text-sm md:text-base text-gray-900 font-lexend">
              {transaction.categories?.name || "-"}
            </p>
          )}
        </div>

        {/* system timestamps */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Dibuat Sistem
            </span>
            <p className="text-sm text-gray-900 font-lexend">
              {formatDate(transaction.created_at)}
            </p>
          </div>
          <div>
            <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Terakhir Update
            </span>
            <p className="text-sm text-gray-900 font-lexend">
              {formatDate(transaction.updated_at)}
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-base"
            >
              <FaEdit /> Edit Transaksi
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-xs md:text-base"
              >
                <FaTimes /> Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges()}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 text-xs md:text-base"
              >
                {isSaving ? (
                  <>
                    <Spinner className="text-white" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <FaSave /> Simpan Perubahan
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ACCOUNT */}
      <div className="bg-surface border border-gray-200 shadow rounded-xl p-6">
        <h3 className="md:text-lg font-semibold text-gray-800 mb-4">
          Rincian Akun
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">
                  Akun
                </th>
                <th className="text-left py-2 font-medium text-gray-600">
                  Tipe
                </th>
                <th className="text-left py-2 font-medium text-gray-600">
                  Nominal
                </th>
              </tr>
            </thead>
            <tbody>
              {transaction.transaction_entries?.map((entry: any) => (
                <tr key={entry.id} className="border-b border-gray-100">
                  <td className="py-3 font-semibold font-lexend">
                    {entry.accounts?.name || "-"}
                  </td>
                  <td className="py-3">
                    {entry.accounts?.type
                      ? getAccountTypeBadge(entry.accounts.type, "text-xs")
                      : "-"}
                  </td>
                  <td
                    className={`py-3 font-semibold ${
                      entry.signed_amount >= 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {formatRupiah(entry.signed_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bukti Transaksi */}
      {transaction.transaction_attachments?.length > 0 && (
        <div className="bg-surface border border-gray-200 shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Bukti Transaksi
          </h3>
          <div className="flex flex-wrap gap-3">
            {transaction.transaction_attachments.map((att: any) => (
              <div
                key={att.id}
                className="relative w-20 h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setFullscreenImage(att.image_url)}
              >
                <img
                  src={att.image_url}
                  alt="attachment"
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-surface border border-red-200 shadow rounded-xl p-6">
        <h3 className="text-red-600 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
          <FaTrashAlt /> Danger Zone
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Menghapus transaksi ini akan menghapus seluruh data terkait (entri,
          bukti) dan tidak dapat dibatalkan.
        </p>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2 text-xs md:text-base"
        >
          {isDeleting ? (
            <>
              <Spinner className="text-white" /> Menghapus...
            </>
          ) : (
            <>
              <FaTrashAlt /> Hapus Transaksi
            </>
          )}
        </button>
      </div>

      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div
            className="relative"
            style={{
              aspectRatio: "5 / 8",
              maxHeight: "90vh",
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImage}
              alt="preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full p-1"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Category Picker */}
      <CategoryPicker
        isOpen={showCategoryPopup}
        onClose={closeCategoryPopup}
        purpose={
          transaction.purpose === "account_transfer"
            ? null
            : transaction.purpose
        }
        onSelect={selectCategory}
      />
    </div>
  );
};

export default Page;
