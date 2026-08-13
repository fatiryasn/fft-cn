import { FaSpinner } from "react-icons/fa";

interface Props {
  message?: string;
  className?: string;
}

export default function LoadingState({
  message = "Memuat data...",
  className = "",
}: Props) {
  return (
    <div className={`text-xs md:text-sm lg:text-base text-center py-4 text-gray-500 ${className}`}>
      <FaSpinner className="animate-spin inline-block mr-2" />
      {message}
    </div>
  );
}
