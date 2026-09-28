import Link from "next/link";
import { FaArrowRight, FaWallet, FaChartLine, FaCoins } from "react-icons/fa";

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center bg-linear-to-t from-secondary/40 via-emerald-50 via-40% to-transparent to-60%">
        {/* ── Decorative background layer ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {/* subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #047857 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            }}
          />
        </div>

        {/* ── Floating accent icons ── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 ">
          <div className="absolute left-[8%] top-[22%] hidden md:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 backdrop-blur border border-white/80 shadow-lg shadow-emerald-900/5 rotate-[-8deg] animate-[float_6s_ease-in-out_infinite]">
            <FaWallet className="text-secondary text-2xl" />
          </div>
          <div className="absolute right-[10%] top-[30%] hidden md:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 backdrop-blur border border-white/80 shadow-lg shadow-emerald-900/5 rotate-[10deg] animate-[float_7s_ease-in-out_infinite]">
            <FaChartLine className="text-emerald-600 text-2xl" />
          </div>
          <div className="absolute left-[14%] bottom-[18%] hidden lg:flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 backdrop-blur border border-white/80 shadow-lg shadow-emerald-900/5 rotate-[6deg] animate-[float_8s_ease-in-out_infinite]">
            <FaCoins className="text-amber-500 text-lg" />
          </div>
          <div className="absolute right-[16%] bottom-[22%] hidden lg:flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 backdrop-blur border border-white/80 shadow-lg shadow-emerald-900/5 rotate-[-12deg] animate-[float_6.5s_ease-in-out_infinite]">
            <span className="text-secondary font-bold text-lg">Rp</span>
          </div>
        </div>

        <div className="relative max-w-2xl space-y-8">
          {/* Heading with gradient accent */}
          <h1 className="font-bold tracking-tight text-text text-5xl lg:text-6xl">
            Catat, Nanti{" "}
            <span className="relative inline-block">
              <span className="bg-linear-to-r from-secondary via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                lupa loh..
              </span>
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                className="absolute -bottom-2 left-0 w-full text-secondary/60"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 50 2, 100 6 T 198 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-sm sm:text-base leading-8 text-text/70 max-w-xl mx-auto px-5 md:px-0">
            <span className="font-semibold text-text">Coino</span> adalah
            platform pencatatan keuangan untuk segala kalangan. Analisis
            cash-flow, budgeting, multi-financial accounts, semuanya ada di
            Coino.
          </p>

          {/* Two CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 px-5 md:px-0">
            <Link
              href="/login"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-secondary/25 transition-all hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-secondary font-poppins"
            >
              Lihat Penawaran
            </Link>
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border-2 border-secondary bg-transparent px-8 py-3 text-sm font-semibold text-secondary shadow-sm transition-all hover:bg-secondary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-secondary/20 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-secondary font-poppins"
            >
              Register
              <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>

      {/* PRICING SECTION */}
      <section id="pricing" className="relative px-4 py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-6xl">
          {/* header */}
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <span className="inline-block rounded-full border border-secondary/20 bg-secondary/5 px-4 py-1.5 text-xs font-medium text-secondary">
              Harga
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Pilih paket yang cocok untukmu
            </h2>
            <p className="text-base leading-7 text-text/70">
              Mulai gratis, upgrade kapan saja. Tanpa biaya tersembunyi, tanpa
              komitmen jangka panjang.
            </p>
          </div>

          {/* cards */}
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-lg font-semibold text-text">Gratis</h3>
              <p className="mt-1 text-sm text-text/60">
                Untuk kamu yang baru mulai mencatat.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-text">Rp0</span>
                <span className="text-sm text-text/60">/bulan</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-text/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Catat transaksi tanpa batas
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  1 akun keuangan
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Laporan bulanan dasar
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg border-2 border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
              >
                Mulai Gratis
              </Link>
            </div>

            {/* Pro (highlighted) */}
            <div className="relative flex flex-col rounded-2xl border-2 border-secondary bg-white p-6 shadow-lg shadow-secondary/10 transition-all hover:-translate-y-1 hover:shadow-xl md:-mt-4 md:mb-4">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Paling Populer
              </span>
              <h3 className="text-lg font-semibold text-text">Pro</h3>
              <p className="mt-1 text-sm text-text/60">
                Untuk yang serius mengatur keuangan.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-text">Rp29rb</span>
                <span className="text-sm text-text/60">/bulan</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-text/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Semua fitur Gratis
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Akun keuangan tanpa batas
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Analisis cash-flow & budgeting
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Export laporan PDF & Excel
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5"
              >
                Coba Pro
                <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {/* Business */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-lg font-semibold text-text">Bisnis</h3>
              <p className="mt-1 text-sm text-text/60">
                Untuk tim & usaha yang berkembang.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-text">Rp99rb</span>
                <span className="text-sm text-text/60">/bulan</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-text/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Semua fitur Pro
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Multi-user & role akses
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  Integrasi & API
                </li>
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg border-2 border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section
        id="contact"
        className="relative px-4 py-20 sm:py-24 bg-linear-to-b from-emerald-50/60 to-transparent"
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
            {/* Left: copy */}
            <div className="space-y-6">
              <span className="inline-block rounded-full border border-secondary/20 bg-white px-4 py-1.5 text-xs font-medium text-secondary shadow-sm">
                Kontak
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Ada pertanyaan? <br />
                <span className="bg-linear-to-r from-secondary to-emerald-600 bg-clip-text text-transparent">
                  Ngobrol yuk.
                </span>
              </h2>
              <p className="text-base leading-7 text-text/70">
                Tim kami siap membantu kamu memilih paket yang tepat, menjawab
                pertanyaan teknis, atau sekadar berbagi tips mengatur keuangan.
              </p>

              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    ✉
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text">Email</p>
                    <p className="text-sm text-text/70">hello@coino.id</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    ☎
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text">Telepon</p>
                    <p className="text-sm text-text/70">+62 812 3456 7890</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    ⌂
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text">Alamat</p>
                    <p className="text-sm text-text/70">
                      Jl. Merdeka No. 10, Jakarta, Indonesia
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right: form */}
            <form className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Nama
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Nama lengkap"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-text placeholder:text-text/40 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-text placeholder:text-text/40 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-text"
                >
                  Pesan
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Tulis pesanmu di sini..."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-text placeholder:text-text/40 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <button
                type="submit"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5"
              >
                Kirim Pesan
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Keyframes for floating icons */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--tw-rotate, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--tw-rotate, 0deg)); }
        }
      `}</style>
    </>
  );
}
