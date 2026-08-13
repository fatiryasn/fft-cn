"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaSave,
  FaTimes,
  FaMoneyBillWave,
  FaWallet,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { enqueueSnackbar } from "notistack";
import {
  getAccountById,
  updateAccount,
  deleteAccount,
  type Account,
} from "@/services/account.service";
import Spinner from "@/components/shared/Spinner";
import { getAccountTypeBadge } from "@/lib/utils/account.util";
import { formatDate, formatRupiah } from "@/lib/utils/common.util";
import { useTitle } from "@/context/TitleContext";
import LoadingState from "@/components/shared/LoadingState";
import FieldError from "@/components/shared/FieldError";

const AkunDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setTitle } = useTitle();

  // Data state
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"cash" | "cashless">("cash");
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    type?: string;
  }>({});

  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  // Detect changes
  const hasChanges = useCallback(() => {
    if (!account) return false;
    return formName !== account.name || formType !== account.type;
  }, [formName, formType, account]);

  // Fetch account by id
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAccountById(id);
      if ("error" in result) {
        setFetchError(result.error || "Terjadi Kesalahan");
      } else {
        setAccount(result.account);
        setFormName(result.account.name);
        setFormType(result.account.type);
        setTitle(`Akun Keuangan | ${result.account.name}`);
      }
      setLoading(false);
    };
    fetchData();

    return () => {
      setTitle("Akun Keuangan");
    };
  }, [id, setTitle]);

  // Enter edit mode
  const handleEdit = () => {
    if (account) {
      setFormName(account.name);
      setFormType(account.type);
      setEditErrors({});
      setIsEditing(true);
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setEditErrors({});
    if (account) {
      setFormName(account.name);
      setFormType(account.type);
    }
  };

  // Save changes
  const handleSave = () => {
    const newErrors: typeof editErrors = {};
    if (
      !formName.trim() ||
      formName.trim().length < 3 ||
      formName.trim().length > 100
    ) {
      newErrors.name = "Nama akun harus 3-100 karakter";
    }
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    startSaving(async () => {
      const result = await updateAccount(id, {
        name: formName.trim(),
        type: formType,
      });

      if (result.error) {
        enqueueSnackbar(result.error, { variant: "error" });
        return;
      }

      enqueueSnackbar("Akun berhasil diperbarui", { variant: "success" });
      setAccount((prev) =>
        prev
          ? {
              ...prev,
              name: formName.trim(),
              type: formType,
              updated_at: new Date().toISOString(),
            }
          : null,
      );
      setIsEditing(false);
    });
  };

  // Delete handler
  const handleDelete = () => {
    Swal.fire({
      title: "Hapus akun?",
      text: "Semua transaksi yang terkait dengan akun ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startDeleting(async () => {
          const res = await deleteAccount(id);
          if (res.error) {
            enqueueSnackbar(res.error, { variant: "error" });
            return;
          }
          enqueueSnackbar("Akun berhasil dihapus", { variant: "success" });
          router.push("/app/settings/akun-keuangan");
        });
      }
    });
  };

  //LOADING / ERROR
  if (loading) {
    return <LoadingState />;
  }
  if (fetchError || !account) {
    return (
      <div className="text-center py-20 text-red-500">
        {fetchError || "Akun tidak ditemukan."}
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
      <div className="bg-surface border border-gray-200 shadow rounded-xl p-4 sm:p-6 space-y-6">
        <h3 className="md:text-lg font-semibold text-gray-800">
          {isEditing ? "Edit Akun" : "Detail Akun"}
        </h3>

        {/* name */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Nama Akun
          </label>
          {isEditing ? (
            <>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                minLength={3}
                maxLength={100}
                className={`w-full px-3 md:px-4 py-2 border shadow rounded-lg focus:outline-none text-sm md:text-base border-gray-200`}
              />
              {editErrors.name && <FieldError message={editErrors.name} className="pt-1" />}
            </>
          ) : (
            <p className="text-base md:text-lg font-semibold text-gray-900 font-lexend">
              {account.name}
            </p>
          )}
        </div>

        {/* tipe */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
            Tipe Akun
          </span>
          {isEditing ? (
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormType("cash")}
                className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 rounded-lg border shadow text-xs sm:text-sm font-medium transition ${
                  formType === "cash"
                    ? "bg-secondary text-white border-secondary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaCheckCircle
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    formType === "cash" ? "opacity-100" : "opacity-0"
                  }`}
                />
                <FaMoneyBillWave className="text-xs sm:text-base" />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setFormType("cashless")}
                className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition ${
                  formType === "cashless"
                    ? "bg-secondary text-white border-secondary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaCheckCircle
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    formType === "cashless" ? "opacity-100" : "opacity-0"
                  }`}
                />
                <FaWallet className="text-xs sm:text-base" />
                Cashless
              </button>
            </div>
          ) : (
            <div className="inline-block">
              {getAccountTypeBadge(account.type, "text-xs md:text-sm")}
            </div>
          )}
        </div>

        {/* init balance */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Saldo Awal
          </span>
          <p className="text-sm md:text-base font-medium text-gray-900 font-lexend">
            {formatRupiah(account.initial_balance)}
          </p>
        </div>

        {/* current balance */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Saldo Saat Ini
          </span>
          <p className="text-sm md:text-base font-semibold font-lexend">
            {formatRupiah(account.current_balance)}
          </p>
        </div>

        {/* system timestamps */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Tanggal Dibuat
            </span>
            <p className="text-sm text-gray-900 font-lexend">
              {formatDate(account.created_at)}
            </p>
          </div>
          {account.updated_at && (
            <div>
              <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Terakhir diperbarui
              </span>
              <p className="text-sm text-gray-900 font-lexend">
                {formatDate(account.updated_at)}
              </p>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-2 sm:gap-3 mt-6">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-xs md:text-sm"
            >
              <FaEdit /> Edit Akun
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-xs md:text-sm"
              >
                <FaTimes /> Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 disabled:opacity-50 text-xs md:text-sm"
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

      {/* DANGER ZONE */}
      <div className="bg-surface border border-red-200 shadow rounded-xl p-4 sm:p-6">
        <h3 className="text-red-600 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
          <FaTrashAlt /> Danger Zone
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Menghapus akun ini akan menghapus semua transaksi yang terkait.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 sm:px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs md:text-sm"
        >
          {isDeleting ? (
            <>
              <Spinner className="text-white" /> Menghapus...
            </>
          ) : (
            <>
              <FaTrashAlt /> Hapus Akun
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AkunDetailPage;
