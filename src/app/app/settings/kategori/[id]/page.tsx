// app/settings/kategori/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import Swal from "sweetalert2";
import { enqueueSnackbar } from "notistack";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/services/category.service";
import Spinner from "@/components/shared/Spinner";
import { getCategoryTypeBadge } from "@/lib/utils/category.util";
import { formatDate } from "@/lib/utils/common.util";
import { useTitle } from "@/context/TitleContext";
import LoadingState from "@/components/shared/LoadingState";
import FieldError from "@/components/shared/FieldError";

const KategoriDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setTitle } = useTitle();

  //STATES
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"income" | "expense">("income");
  const [formDescription, setFormDescription] = useState("");
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    type?: string;
    description?: string;
  }>({});

  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  //DETECT CHANGES
  const hasChanges = useCallback(() => {
    if (!category) return false;
    return (
      formName !== category.name ||
      formType !== category.type ||
      formDescription !== (category.description || "")
    );
  }, [formName, formType, formDescription, category]);

  //FETCH CATEGORY BY ID
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getCategoryById(id);
      if ("error" in result) {
        setFetchError(result.error || "Terjadi Kesalahan");
      } else {
        setCategory(result.category);
        setFormName(result.category.name);
        setFormType(result.category.type);
        setFormDescription(result.category.description || "");

        setTitle(`Kategori Transaksi | ${result.category.name}`);
      }
      setLoading(false);
    };
    fetchData();

    return () => {
      setTitle("Kategori Transaksi");
    };
  }, [id, setTitle]);

  //HANDLE EDIT
  const handleEdit = () => {
    if (category) {
      setFormName(category.name);
      setFormType(category.type);
      setFormDescription(category.description || "");
      setEditErrors({});
      setIsEditing(true);
    }
  };

  //CANCEL EDIT
  const handleCancel = () => {
    setIsEditing(false);
    setEditErrors({});
    if (category) {
      setFormName(category.name);
      setFormType(category.type);
      setFormDescription(category.description || "");
    }
  };

  //HANDLE SAVE
  const handleSave = () => {
    const newErrors: typeof editErrors = {};
    if (
      !formName.trim() ||
      formName.trim().length < 3 ||
      formName.trim().length > 100
    ) {
      newErrors.name = "Nama harus 3-100 karakter";
    }
    if (formDescription.length > 300) {
      newErrors.description = "Deskripsi maksimal 300 karakter";
    }
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    startSaving(async () => {
      const result = await updateCategory(id, {
        name: formName.trim(),
        type: formType,
        description: formDescription.trim() || undefined,
      });

      if (result.error) {
        enqueueSnackbar(result.error, { variant: "error" });
        return;
      }

      enqueueSnackbar("Kategori berhasil diperbarui", { variant: "success" });
      setCategory((prev) =>
        prev
          ? {
              ...prev,
              name: formName.trim(),
              type: formType,
              description: formDescription.trim() || null,
              updated_at: new Date().toISOString(),
            }
          : null,
      );
      setIsEditing(false);
    });
  };

  //HANDLE DELETE
  const handleDelete = () => {
    Swal.fire({
      title: "Hapus kategori?",
      text: "Transaksi yang menggunakan kategori ini akan menjadi tidak berkategori (null). Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        startDeleting(async () => {
          const res = await deleteCategory(id);
          if (res.error) {
            enqueueSnackbar(res.error, { variant: "error" });
            return;
          }
          enqueueSnackbar("Kategori berhasil dihapus", { variant: "success" });
          router.push("/app/settings/kategori");
        });
      }
    });
  };

  //RENDER
  if (loading) {
    return <LoadingState />;
  }
  if (fetchError || !category) {
    return (
      <div className="text-center py-20 text-red-500">
        {fetchError || "Kategori tidak ditemukan."}
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
          {isEditing ? "Edit Kategori" : "Detail Kategori"}
        </h3>

        {/* Nama */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Nama Kategori
          </label>
          {isEditing ? (
            <>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                minLength={3}
                maxLength={100}
                className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none text-sm md:text-base ${
                  editErrors.name ? "border-red-300" : "border-gray-200"
                }`}
              />
              {editErrors.name && (
                <FieldError message={editErrors.name} className="pt-1" />
              )}
            </>
          ) : (
            <p className="text-base md:text-lg font-semibold text-gray-900 font-lexend">
              {category.name}
            </p>
          )}
        </div>

        {/* Tipe */}
        <div>
          <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
            Tipe
          </span>
          {isEditing ? (
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormType("income")}
                className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition ${
                  formType === "income"
                    ? "bg-secondary text-white border-secondary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaCheckCircle
                  className={`absolute hidden sm:block left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    formType === "income" ? "opacity-100" : "opacity-0"
                  }`}
                />
                <FaArrowTrendUp className="text-xs sm:text-base" />
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setFormType("expense")}
                className={`relative flex items-center justify-center gap-2 flex-1 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition ${
                  formType === "expense"
                    ? "bg-secondary text-white border-secondary"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FaCheckCircle
                  className={`absolute hidden sm:block left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    formType === "expense" ? "opacity-100" : "opacity-0"
                  }`}
                />
                <FaArrowTrendDown className="text-xs sm:text-base" />
                Pengeluaran
              </button>
            </div>
          ) : (
            <div className="inline-block">
              {getCategoryTypeBadge(category.type, "text-xs md:text-sm")}
            </div>
          )}
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Deskripsi <span className="text-gray-400">(opsional)</span>
          </label>
          {isEditing ? (
            <>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                maxLength={300}
                rows={3}
                className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none resize-none text-sm md:text-base ${
                  editErrors.description ? "border-red-300" : "border-gray-200"
                }`}
              />
              <div className="flex justify-between mt-1">
                {editErrors.description ? (
                  <FieldError
                    message={editErrors.description}
                    className="pt-0"
                  />
                ) : (
                  <p className="text-xs text-gray-600">Maks. 300 karakter</p>
                )}
                <span className="text-xs text-gray-400">
                  {formDescription.length}/300
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm md:text-base text-gray-900 font-lexend">
              {category.description || "-"}
            </p>
          )}
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Tanggal Dibuat
            </span>
            <p className="text-sm text-gray-900 font-lexend">
              {formatDate(category.created_at)}
            </p>
          </div>
          {category.updated_at && (
            <div>
              <span className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                Terakhir diperbarui
              </span>
              <p className="text-sm text-gray-900 font-lexend">
                {formatDate(category.updated_at)}
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
              <FaEdit /> Edit Kategori
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
          Menghapus kategori ini akan membuat transaksi yang terkait menjadi{" "}
          <strong>tidak berkategori</strong>. Tindakan ini tidak dapat
          dibatalkan.
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
              <FaTrashAlt /> Hapus Kategori
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default KategoriDetailPage;
