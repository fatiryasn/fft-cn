"use client";

import { useState } from "react";
import AppNavbar from "./AppNavbar";
import AppSidebar from "./AppSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AppNavbar onMenuToggle={toggleMobileSidebar} />

        <main className="flex-1 overflow-y-auto py-5 lg:py-0 px-3 sm:px-5 pb-20">{children}</main>
      </div>
    </div>
  );
}
