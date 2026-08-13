"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaBars } from "react-icons/fa";
import { useTitle } from "@/context/TitleContext";
import { getCurrentProfile } from "@/services/auth.service";

const getInitials = (fullName: string): string => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  const word = parts[0];
  if (word.length === 0) return "??";
  if (word.length === 1) return word[0].toUpperCase() + word[0].toUpperCase();
  return (word[0] + word[1]).toUpperCase();
};

const MAIN_ROUTES = [
  "/app",
  "/app/transaksi",
  "/app/hutang-piutang",
  "/app/laporan",
  "/app/settings/akun-keuangan",
  "/app/settings/kategori",
  "/app/settings/profil",
];

interface Props {
  onMenuToggle: () => void;
}

const AppNavbar = ({ onMenuToggle }: Props) => {
  const { title } = useTitle();
  const pathname = usePathname();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    email: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const profile = await getCurrentProfile();
      if (profile) {
        setUserProfile({
          fullName: profile.full_name,
          email: profile.email,
          initials: getInitials(profile.full_name),
        });
      } else {
        setUserProfile(null);
      }
    };
    fetchUser();
  }, []);

  const isSubPage = !MAIN_ROUTES.includes(pathname);

  return (
    <header className="lg:p-5 bg-transparent">
      {/* coino logo row (only on mobile/tab) */}
      <div className="flex lg:hidden items-center bg-secondary/10 px-5">
        <img
          src="/coino-logo.png"
          alt="App Logo"
          className="h-6 object-contain"
        />
      </div>
      <div className="bg-surface border border-gray-200 shadow lg:rounded-xl px-6 py-2.5 lg:py-2 flex items-center justify-between w-full gap-2">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {isSubPage && (
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-800 transition-colors p-1 -ml-1"
              aria-label="Kembali"
            >
              <FaArrowLeft className="text-sm md:text-base lg:text-lg" />
            </button>
          )}

          <h1 className="md:text-lg lg:text-xl font-bold text-gray-800 tracking-tight transition-all duration-200">
            {title}
          </h1>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors p-1 -ml-1"
            aria-label="Menu"
          >
            <FaBars className="md:text-lg" />
          </button>
          <Link
            href="/app/settings/profil"
            className="flex items-center gap-3 md:py-2 md:px-4 rounded-lg hover:bg-secondary/10 transition-all group"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-secondary/60 text-gray-50 rounded-xl flex items-center justify-center font-bold text-xs md:text-sm tracking-wider uppercase flex-shrink-0 transition-colors">
              {userProfile?.initials || "?"}
            </div>
            <div className="flex-col text-left leading-tight hidden sm:flex max-w-[120px]">
              <span className="text-sm font-semibold text-gray-700 group-hover:text-secondary transition-colors truncate">
                {userProfile?.fullName || ""}
              </span>
              <span className="text-[10px] text-gray-400 font-medium truncate">
                {userProfile?.email || ""}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
