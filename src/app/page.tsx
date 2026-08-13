import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl space-y-8">
        {/* Logo */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 p-3">
          <img
            src="/coino-logo.png"
            alt="Coino Logo"
            className="h-full w-full object-contain"
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Take Control of Your Finances
        </h1>

        <p className="text-lg leading-8 text-text/70">
          Track expenses, set budgets, and achieve your financial goals with our
          simple yet powerful finance tracker.
        </p>

        {/* Two CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border-2 border-primary bg-transparent px-8 py-3 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
