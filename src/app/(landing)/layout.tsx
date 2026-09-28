"use client";

import LandingFooter from "@/components/layout/LandingFooter";
import LandingNavbar from "@/components/layout/LandingNavbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </>
  );
}
