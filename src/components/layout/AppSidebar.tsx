"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiHome,
  FiPieChart,
  FiSettings,
  FiTag,
  FiPlusCircle,
  FiFolderPlus,
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { BiReceipt, BiWallet, BiUserCircle } from "react-icons/bi";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";

interface Props {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const AppSidebar = ({ mobileOpen, onMobileClose }: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPengelolaanOpen, setIsPengelolaanOpen] = useState(false);

  //navs
  const mainNav = [
    { id: 1, label: "Home", icon: FiHome, href: "/app" },
    { id: 2, label: "Transaksi", icon: BiReceipt, href: "/app/transaksi" },
    { id: 3, label: "Laporan", icon: FiPieChart, href: "/app/laporan" },
  ];
  const pengelolaanNav = [
    {
      id: "5a",
      label: "Akun Keuangan",
      icon: BiWallet,
      href: "/app/settings/akun-keuangan",
    },
    {
      id: "5b",
      label: "Kategori Transaksi",
      icon: FiTag,
      href: "/app/settings/kategori",
    },
    {
      id: "5c",
      label: "Profil",
      icon: BiUserCircle,
      href: "/app/settings/profil",
    },
  ];

  //quick actions
  const quickActions = [
    {
      id: "q1",
      label: "Buat Transaksi",
      icon: FiPlusCircle,
      href: "/app/transaksi/tambah",
    },
    {
      id: "q3",
      label: "Akun Keuangan Baru",
      icon: FiFolderPlus,
      href: "/app/settings/akun-keuangan/tambah",
    },
  ];

  //render content
  const renderContent = (isMobile: boolean) => {
    const expanded = isMobile ? true : isExpanded;
    const pengelolaanOpen = isPengelolaanOpen;

    return (
      <>
        {/* HEADER */}
        <div
          className={`flex items-center h-20 border-b border-gray-100 transition-all duration-300 ${
            expanded ? "px-4" : "px-0 justify-center"
          }`}
        >
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${
              expanded ? "w-24 md:w-28 lg:w-32 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <img
              src="/coino-logo.png"
              alt="App Logo"
              className="w-full object-contain "
            />
          </div>

          {/* DESKTOP */}
          {!isMobile && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`bg-white p-1.5 text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0 flex items-center justify-center ${
                expanded ? "ml-auto" : ""
              }`}
            >
              {expanded ? (
                <GoSidebarCollapse size={20} />
              ) : (
                <GoSidebarExpand size={20} />
              )}
            </button>
          )}

          {/* mobile close button */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="ml-auto text-gray-500 hover:text-gray-800"
            >
              <FiX className="text-xl md:text-2xl" />
            </button>
          )}
        </div>

        {/* NAV AREA */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 hide-scrollbar">
          {/* MAIN NAV */}
          <nav className="px-3 flex flex-col gap-1">
            <div
              className={`transition-all duration-300 overflow-hidden ${
                expanded ? "max-h-8 opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"
              }`}
            >
              <p className="text-xs font-semibold text-gray-400 px-3 uppercase tracking-wider whitespace-nowrap font-lexend">
                Menu Utama
              </p>
            </div>

            {mainNav.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onMobileClose}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-600 rounded-lg hover:bg-secondary/5 hover:text-secondary transition-colors w-full group overflow-hidden"
              >
                <item.icon className="text-lg md:text-xl xl:text-2xl min-w-[20px] flex-shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 text-sm lg:text-base ${
                    expanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4 w-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}

            {/* SETTINGS */}
            <div className="flex flex-col mt-1">
              <button
                onClick={() => setIsPengelolaanOpen(!isPengelolaanOpen)}
                className="flex items-center justify-between px-3 py-2.5 text-gray-600 rounded-lg hover:bg-secondary/5 hover:text-secondary transition-colors w-full overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <FiSettings className="text-lg md:text-xl xl:text-2xl min-w-[20px] flex-shrink-0" />
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 text-sm lg:text-base ${
                      expanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 w-0"
                    }`}
                  >
                    Pengelolaan
                  </span>
                </div>
                <FiChevronDown
                  size={16}
                  className={`flex-shrink-0 transition-all duration-200 ${
                    expanded ? "opacity-100" : "opacity-0 w-0 hidden"
                  } ${pengelolaanOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
                  expanded && pengelolaanOpen
                    ? "max-h-48 opacity-100 mt-1"
                    : "max-h-0 opacity-0 mt-0"
                }`}
              >
                <div className="pl-10 pr-3 flex flex-col gap-1">
                  {pengelolaanNav.map((subItem) => (
                    <Link
                      key={subItem.id}
                      href={subItem.href}
                      onClick={onMobileClose}
                      className="flex items-center gap-2 px-3 py-2 text-xs lg:text-sm text-gray-500 rounded-lg hover:bg-secondary/5 hover:text-secondary transition-colors w-full text-left whitespace-nowrap"
                    >
                      <subItem.icon className="text-base md:text-lg xl:text-xl min-w-[16px] flex-shrink-0" />
                      <span>{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <hr className="border-gray-100 mx-6" />

          {/* QUICK ACTIONS */}
          <div className="px-3">
            <div
              className={`transition-all duration-300 overflow-hidden ${
                expanded ? "max-h-8 opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"
              }`}
            >
              <p className="text-xs font-semibold text-gray-400 px-3 uppercase tracking-wider whitespace-nowrap font-lexend">
                Aksi Cepat
              </p>
            </div>

            <div className="flex flex-col gap-1">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  onClick={onMobileClose}
                  className="flex items-center gap-3 px-3 py-2.5 text-secondary rounded-lg hover:bg-secondary/5 hover:text-secondary/80 transition-colors w-full group overflow-hidden"
                >
                  <action.icon className="text-base md:text-lg xl:text-xl min-w-[20px] flex-shrink-0" />
                  <span
                    className={`font-medium whitespace-nowrap text-xs lg:text-sm transition-all duration-300 ${
                      expanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 w-0"
                    }`}
                  >
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:block">
        <aside
          className={`relative h-screen bg-surface border-r border-gray-200 shadow flex flex-col transition-all duration-300 ease-in-out ${
            isExpanded ? "w-80" : "w-20"
          }`}
        >
          {renderContent(false)}
        </aside>
      </div>

      {/* MOBILE */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />

        <div
          className={`relative z-10 h-full w-80 max-w-full bg-surface border-r border-gray-200 shadow flex flex-col transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {renderContent(true)}
        </div>
      </div>
    </>
  );
};

export default AppSidebar;
