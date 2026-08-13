"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaCalendar,
  FaChartLine,
  FaCog,
  FaWallet,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTitle } from "@/context/TitleContext";
import { getHomeData, type HomeData } from "@/services/home.service";
import { formatRupiah } from "@/lib/utils/common.util";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";

//NAVIGATIONS
const navigationCards = [
  {
    title: "Transaksi",
    href: "/app/transaksi",
    icon: <FaWallet className="text-xl md:text-2xl text-secondary" />,
    description: "Lihat & kelola riwayat transaksi",
  },
  {
    title: "Laporan",
    href: "/app/laporan",
    icon: <FaChartLine className="text-xl md:text-2xl text-secondary" />,
    description: "Analisis keuangan Anda",
  },
  {
    title: "Pengelolaan",
    href: "/app/settings/akun-keuangan",
    icon: <FaCog className="text-xl md:text-2xl text-secondary" />,
    description: "Akun, kategori, dan profil",
  },
];

const Page = () => {
  const { setTitle } = useTitle();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle("Home");
  }, [setTitle]);

  //GET HOME DATA
  const fetchHome = useCallback(async () => {
    try {
      const homeData = await getHomeData();
      setData(homeData);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  const [chartFontSize, setChartFontSize] = useState(12);

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 640) setChartFontSize(10);
      else if (w < 1024) setChartFontSize(12);
      else setChartFontSize(14);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  //cash flow
  const cashFlow = useMemo(() => {
    if (!data?.transactions) return [];
    const dailyMap: Record<string, { income: number; expense: number }> = {};

    data.transactions.forEach((tx) => {
      const localDate = new Date(tx.transaction_at).toLocaleDateString("sv-SE");

      const netAmount = tx.transaction_entries.reduce(
        (sum, e) => sum + (e.signed_amount ?? 0),
        0,
      );

      if (!dailyMap[localDate]) {
        dailyMap[localDate] = { income: 0, expense: 0 };
      }

      if (tx.purpose === "income") {
        dailyMap[localDate].income += netAmount;
      } else if (tx.purpose === "expense") {
        dailyMap[localDate].expense += Math.abs(netAmount);
      } else if (tx.purpose === "account_transfer") {
        if (netAmount > 0) {
          dailyMap[localDate].income += netAmount;
        } else if (netAmount < 0) {
          dailyMap[localDate].expense += Math.abs(netAmount);
        }
      }
    });

    return Object.entries(dailyMap)
      .filter(([, vals]) => vals.income > 0 || vals.expense > 0)
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  if (loading) return <LoadingState message="Memuat dashboard..." />;
  if (error || !data)
    return (
      <ErrorState error={error || "Data tidak tersedia"} onRetry={fetchHome} />
    );

  const chartData = cashFlow.map((day) => ({
    date: day.date.slice(8),
    Pemasukan: day.income,
    Pengeluaran: day.expense,
  }));

  return (
    <div className="mx-auto space-y-8 pb-10">
      {/* Welcome & Balance */}
      <div className="bg-surface border border-gray-200 shadow rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            Halo, {data.fullName.split(" ")[0]} 👋
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-gray-600 mt-1">
            Semoga harimu menyenangkan!
          </p>
        </div>
        <div className="flex-1 bg-secondary/5 rounded-xl p-2 md:p-4">
          <p className="text-sm text-gray-500 font-medium">Saldo Saat Ini</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary mt-1">
            {formatRupiah(data.totalBalance)}
          </p>
        </div>
      </div>

      {/* Monthly Cash Flow Chart */}
      <div className="bg-surface border border-gray-200 shadow rounded-xl p-4 md:p-6">
        <h2 className="md:text-lg font-semibold text-gray-800 mb-2">
          Arus Kas Bulan Ini
        </h2>
        <p className="text-secondary flex items-center gap-2 text-xs md:text-sm mb-5 ">
          <FaCalendar />
          {new Date().toLocaleString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </p>
        {chartData.length > 0 ? (
          <div className="overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={600}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: chartFontSize }} />
                <YAxis tick={{ fontSize: chartFontSize }} />
                <Tooltip
                  formatter={(value) => formatRupiah(Number(value ?? 0))}
                  labelFormatter={(label) => `Tanggal ${label}`}
                />
                <Legend />
                <Line
                  type="linear"
                  dataKey="Pemasukan"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="linear"
                  dataKey="Pengeluaran"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Belum ada transaksi bulan ini.
          </p>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-surface border border-gray-200 shadow rounded-xl p-5 hover:shadow-md hover:border-secondary/30 transition-all group flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {card.icon}
              <h3 className="text-sm md:text-base font-semibold text-gray-800">
                {card.title}
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {card.description}
            </p>
            <div className="flex justify-end mt-auto">
              <FaArrowRight className="text-gray-400 group-hover:text-secondary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
