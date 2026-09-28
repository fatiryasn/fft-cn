"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ComponentProps } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaArrowRight } from "react-icons/fa";

const navLinks = [
  { href: "/#about-us", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const Navbar = () => {
  const pathname = usePathname();

  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const navbarStyle = isHome
    ? scrolled
      ? "bg-white border-b-[0.2px] border-gray-100"
      : "bg-transparent border-b border-transparent"
    : "bg-white border-b-[0.2px] border-gray-100";

  return (
    <>
      <div
        className={`${
          isHome && "animate-onlyFade"
        } fixed top-0 right-0 left-0 flex justify-between transition-all duration-300 items-center py-4 px-5 sm:px-10 lg:px-28 z-50 ${navbarStyle} ${
          isSidebarOpen && "bg-white"
        }`}
      >
        <Link href="/">
          <img
            src="/coino-logo.png"
            alt={"logoAlt"}
            loading="lazy"
            className="w-20 md:w-28 lg:w-32 h-auto object-contain p-1"
          />
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 lg:gap-6">
          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => (
              <NavItem key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* desktop register btn */}
          <Link
            href="/register"
            className="group hidden md:inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold font-manrope text-white shadow-sm hover:bg-cyan-700 hover:shadow-md transition-all"
          >
            Register
            <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
          </Link>

          {/* mobile ham menu */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isSidebarOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? (
              <HiOutlineXMark className="text-2xl" />
            ) : (
              <RxHamburgerMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed top-16 right-0 left-0 h-fit w-full bg-white z-40 transform transition-transform duration-500 ease-in-out ${
          isSidebarOpen ? "translate-y-0" : "-translate-y-80"
        }`}
      >
        <nav className="flex flex-col gap-4 p-4 text-base font-jura">
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}

          <Link
            href="/register"
            onClick={() => setIsSidebarOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold font-manrope text-white shadow-sm hover:bg-cyan-700 transition-all"
          >
            Register
            <FaArrowRight className="text-xs" />
          </Link>
        </nav>
      </aside>
    </>
  );
};

const NavItem = ({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) => (
  <div className="flex flex-col items-center group cursor-pointer">
    <Link
      href={href as ComponentProps<typeof Link>["href"]}
      onClick={onClick}
      className="font-medium font-manrope flex items-center gap-1"
    >
      <span>{label}</span>
    </Link>
    <div className="w-20 h-0.5 bg-cyan-600 rounded-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></div>
  </div>
);

export default Navbar;
