export interface RecommendedCategory {
  name: string;
  type: "income" | "expense";
  description: string;
}

export const RECOMMENDED_CATEGORIES: RecommendedCategory[] = [
  // ── Income ─────────────────────────────────────────
  {
    name: "Gaji",
    type: "income",
    description: "Pendapatan rutin dari pekerjaan tetap",
  },
  {
    name: "Freelance & Proyek",
    type: "income",
    description: "Pendapatan dari pekerjaan lepas atau proyek",
  },
  {
    name: "Investasi",
    type: "income",
    description: "Dividen, bunga, atau keuntungan investasi",
  },
  {
    name: "Hadiah",
    type: "income",
    description: "Uang atau barang yang diterima sebagai hadiah",
  },
  {
    name: "Bisnis",
    type: "income",
    description: "Pendapatan dari usaha atau bisnis sendiri",
  },
  {
    name: "Lainnya",
    type: "income",
    description: "Pendapatan lain di luar kategori utama",
  },

  // ── Expense ────────────────────────────────────────
  {
    name: "Makanan & Minuman",
    type: "expense",
    description: "Belanja harian, makan di luar, dan minuman",
  },
  {
    name: "Transportasi",
    type: "expense",
    description: "Transportasi umum, bensin, parkir, dan tol",
  },
  {
    name: "Tempat Tinggal",
    type: "expense",
    description: "Sewa, cicilan rumah, listrik, air, dan internet",
  },
  {
    name: "Pendidikan",
    type: "expense",
    description: "Biaya sekolah, kursus, dan buku",
  },
  {
    name: "Kesehatan",
    type: "expense",
    description: "Obat, dokter, rumah sakit, dan asuransi kesehatan",
  },
  {
    name: "Hiburan",
    type: "expense",
    description: "Film, liburan, hobi, dan rekreasi",
  },
  {
    name: "Langganan & Digital",
    type: "expense",
    description: "Langganan streaming, aplikasi, dan layanan digital",
  },
  {
    name: "Donasi & Sosial",
    type: "expense",
    description: "Donasi, zakat, dan bantuan sosial",
  },
  {
    name: "Lainnya",
    type: "expense",
    description: "Pengeluaran lain di luar kategori utama",
  },
];
