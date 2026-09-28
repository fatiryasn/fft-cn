import Link from "next/link";
import { FaInstagram, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const navLinks = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: "/#features" },
      { label: "Harga", href: "/#pricing" },
      { label: "Integrasi", href: "/#integrations" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "/#about-us" },
      { label: "Karier", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Dukungan",
    links: [
      { label: "Kontak", href: "/#contact" },
      { label: "Bantuan", href: "/help" },
      { label: "Kebijakan Privasi", href: "/privacy" },
    ],
  },
];

const socials = [
  { icon: <FaInstagram />, href: "https://instagram.com", label: "Instagram" },
  { icon: <FaTwitter />, href: "https://twitter.com", label: "Twitter" },
  { icon: <FaLinkedin />, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: <FaGithub />, href: "https://github.com", label: "GitHub" },
];

const LandingFooter = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src="/coino-logo.png"
                alt={"logoAlt"}
                loading="lazy"
                className="w-28 md:w-32 lg:w-40 h-auto object-contain p-1"
              />
            </Link>
            <p className="max-w-xs text-sm leading-6 text-text/70">
              Platform pencatatan keuangan untuk segala kalangan. Catat,
              analisis, dan kelola keuanganmu dalam satu tempat.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-text/60 transition-all hover:border-secondary hover:bg-secondary hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {navLinks.map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-text">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text/70 transition-colors hover:text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
          <p className="text-xs text-text/60">
            © {new Date().getFullYear()} Coino. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="text-xs text-text/60 transition-colors hover:text-secondary"
            >
              Syarat & Ketentuan
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-text/60 transition-colors hover:text-secondary"
            >
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
