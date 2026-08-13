// context/TitleContext.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const STATIC_TITLE_MAP: Record<string, string> = {
  "/app": "Home",
  "/app/transaksi": "Transaksi",
  "/app/transaksi/tambah": "Tambah Transaksi",
  "/app/hutang-piutang": "Hutang & Piutang",
  "/app/hutang-piutang/tambah": "Tambah Hutang / Piutang",
  "/app/laporan": "Laporan",
  "/app/settings/akun-keuangan": "Akun Keuangan",
  "/app/settings/akun-keuangan/tambah": "Tambah Akun Keuangan",
  "/app/settings/kategori": "Kategori Transaksi",
  "/app/settings/kategori/tambah": "Tambah Kategori Transaksi",
  "/app/settings/profil": "Profil Pengguna",
};

interface TitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const TitleContext = createContext<TitleContextType>({
  title: "Home",
  setTitle: () => {},
});

export const TitleProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [title, setTitle] = useState<string>(
    () => STATIC_TITLE_MAP[pathname] || "Home",
  );

  useEffect(() => {
    const staticTitle = STATIC_TITLE_MAP[pathname];
    if (staticTitle) {
      setTitle(staticTitle);
    }
  }, [pathname]);

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
};

export const useTitle = () => useContext(TitleContext);
