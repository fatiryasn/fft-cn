"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { enqueueSnackbar } from "notistack";
import { FaEdit, FaSave, FaTimes, FaSignOutAlt } from "react-icons/fa";
import Spinner from "@/components/shared/Spinner";
import { useTitle } from "@/context/TitleContext";
import { getProfileData, updateProfile } from "@/services/profile.service";
import { logout } from "@/services/auth.service";
import { formatDate } from "@/lib/utils/common.util";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import FieldError from "@/components/shared/FieldError";

const providerLabels: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  email: "Email",
};

const Page = () => {
  const router = useRouter();
  const { setTitle } = useTitle();

  //STATES
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  //edit
  const [isEditing, setIsEditing] = useState(false);
  const [formFullName, setFormFullName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, startSaving] = useTransition();

  //INIT
  useEffect(() => {
    setTitle("Profil Pengguna");
  }, [setTitle]);
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfileData();
        setProfile(data);
        setFormFullName(data.full_name || "");
        setFormPhone(data.phone_number || "");
      } catch (e: any) {
        setFetchError(e.message || "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  //EDIT HANDLERS
  const handleEdit = () => {
    setFormFullName(profile.full_name || "");
    setFormPhone(profile.phone_number || "");
    setErrors({});
    setIsEditing(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    if (profile) {
      setFormFullName(profile.full_name || "");
      setFormPhone(profile.phone_number || "");
    }
  };

  //DETECT CHANGES
  const hasChanges = useCallback(() => {
    if (!profile) return false;
    return (
      formFullName.trim() !== (profile.full_name || "").trim() ||
      formPhone.trim() !== (profile.phone_number || "").trim()
    );
  }, [formFullName, formPhone, profile]);

  const handleSave = () => {
    setErrors({});

    startSaving(async () => {
      const result = await updateProfile({
        full_name: formFullName.trim(),
        phone_number: formPhone.trim() || undefined,
      });

      //error
      if (result?.error) {
        if (result.validationErrors) {
          setErrors(result.validationErrors);
          enqueueSnackbar("Periksa kembali input yang bermasalah", {
            variant: "warning",
          });
        } else {
          enqueueSnackbar(result.error, { variant: "error" });
        }
        return;
      }

      //success
      setProfile((prev: any) => ({
        ...prev,
        full_name: formFullName.trim(),
        phone_number: formPhone.trim() || undefined,
      }));
      enqueueSnackbar("Profil berhasil diperbarui", { variant: "success" });
      setIsEditing(false);
    });
  };

  //LOGOUT HANDLER
  const handleLogout = () => {
    Swal.fire({
      title: "Keluar?",
      text: "Anda akan keluar dari akun.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Keluar",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        router.push("/");
      }
    });
  };

  if (loading) return <LoadingState message="Memuat profil..." />;
  if (fetchError || !profile)
    return <ErrorState error={fetchError || "Profil tidak ditemukan."} />;

  return (
    <div className="mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-surface border border-gray-200 shadow rounded-xl p-4 sm:p-6 space-y-6">
        <h3 className="md:text-lg font-semibold text-gray-800">
          Informasi Profil
        </h3>

        {/* Nama Lengkap */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap
          </label>
          {isEditing ? (
            <>
              <input
                type="text"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                maxLength={100}
                className={`w-full px-3 md:px-5 py-2 md:py-3 border rounded-lg focus:outline-none text-sm md:text-base border-gray-200
                `}
              />
              {errors.full_name && (
                <FieldError message={errors.full_name} className="pt-1" />
              )}
            </>
          ) : (
            <p className="text-sm md:text-base text-gray-900 font-lexend">
              {profile.full_name || "-"}
            </p>
          )}
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Nomor Telepon
          </label>
          {isEditing ? (
            <>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3 md:px-5 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none text-sm md:text-base"
              />
              {errors.phone_number && (
                <FieldError message={errors.phone_number} className="pt-1" />
              )}
            </>
          ) : (
            <p className="text-sm md:text-base text-gray-900 font-lexend">
              {profile.phone_number || "-"}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <p className="text-sm md:text-base text-gray-900 font-lexend">
            {profile.email}
          </p>
        </div>

        {/* Metode Login */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Metode Login
          </label>
          <p className="text-sm md:text-base text-gray-900 font-lexend">
            {providerLabels[profile.provider] || profile.provider}
          </p>
        </div>

        {/* Tanggal Bergabung */}
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
            Tanggal Bergabung
          </label>
          <p className="text-sm md:text-base text-gray-900 font-lexend">
            {formatDate(profile.created_at)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 sm:gap-3 pt-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm"
            >
              <FaEdit /> Edit Profil
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
                    <FaSave /> Simpan
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="bg-surface border border-red-200 shadow rounded-xl p-4 sm:p-6">
        <h3 className="text-gray-800 font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
          <FaSignOutAlt /> Logout
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">
          Keluar dari akun ini, butuh login ulang untuk mengakses aplikasi.
        </p>
        <button
          onClick={handleLogout}
          className="px-4 sm:px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-xs md:text-sm"
        >
          <FaSignOutAlt /> Keluar
        </button>
      </div>
    </div>
  );
};

export default Page;
