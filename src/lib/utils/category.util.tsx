import { ReactNode } from "react";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

//type labels
export const typeLabels: Record<string, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
};

//type badge
export const getCategoryTypeBadge = (
  tipe: string,
  className?: string,
): ReactNode => {
  const baseClass = `inline-flex font-poppins items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold ${className ?? "text-sm"}`;

  switch (tipe) {
    case "income":
      return (
        <span className={`${baseClass} bg-green-100 text-green-800`}>
          <FaArrowTrendUp className="text-green-600" />
          Income
        </span>
      );
    case "expense":
      return (
        <span className={`${baseClass} bg-red-100 text-red-800`}>
          <FaArrowTrendDown className="text-red-600" />
          Expense
        </span>
      );
    default:
      return (
        <span className={`${baseClass} bg-gray-100 text-gray-800`}>{tipe}</span>
      );
  }
};

//truncate description
export function truncateDescription(desc: string | null, max = 50) {
  if (!desc) return "-";
  return desc.length > max ? desc.slice(0, max) + "..." : desc;
}
