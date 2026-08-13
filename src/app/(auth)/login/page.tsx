"use client";

import { login } from "@/services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { FaHome } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //HANDLE SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      enqueueSnackbar("Email dan password harus diisi");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await login(formData);

      if (!result.success) {
        enqueueSnackbar(result.message, {
          variant: "warning",
        });
        return;
      }
      enqueueSnackbar(result.message, {
        variant: "success",
      });

      router.push("/app");
      router.refresh();
    } catch (err) {
      enqueueSnackbar("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left */}
      <div className="flex justify-center items-center p-20 bg-white rounded-r-full border-r-secondary border-r-8">
        <div className="flex flex-col gap-3">
          {/* logo */}
          <div className="h-auto w-96">
            <img
              src="/coino-logo.png"
              alt="Coino Logo"
              className="object-cover w-full h-full"
            />
          </div>
          {/* description */}
          <p className="max-w-lg leading-relaxed">
            Catat pergerakan keuangan anda dari berbagai sumber dalam satu
            aplikasi.
          </p>

          {/* back to home */}
          <Link
            href="/"
            className="text-sm text-secondary flex items-center gap-1.5 font-semibold"
          >
            <FaHome /> Kembali ke beranda
          </Link>
        </div>
      </div>
      {/* Right */}
      <div className="flex items-center justify-center p-20 flex-1">
        <div className="flex flex-col gap-3">
          <h1 className="font-bold text-3xl">Login</h1>
          <p className="text-gray-700 text-sm">
            Masukkan akun anda yang sudah terdaftar untuk mengakses aplikasi.
          </p>

          {/* login with google */}
          <button className="flex items-center justify-center px-5 py-3 mt-10 gap-3 border border-gray-200 rounded-lg bg-surface hover:bg-gray-100 transition shadow">
            <img
              src="/google-logo.webp"
              alt="Google"
              className="aspect-square h-5"
            />
            <span>Login dengan Google</span>
          </button>

          <div className="flex gap-7 items-center mt-5">
            <div className="bg-gray-200 rounded-full h-[1.5px] w-full"></div>
            <span className="text-nowrap text-xs text-gray-600">
              Atau login dengan
            </span>
            <div className="bg-gray-200 rounded-full h-[1.5px] w-full"></div>
          </div>
          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-5 py-3 bg-surface border border-gray-200 shadow rounded-lg focus:outline-none"
                placeholder="youremail@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-5 py-3 bg-surface border border-gray-200 shadow rounded-lg focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-white shadow transition-all hover:bg-secondary/90 mt-5"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* register */}
          <p className="text-sm text-gray-700 mt-5">
            Baru di coino?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline cursor-pointer font-semibold"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
