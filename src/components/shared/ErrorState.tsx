import { FaExclamationTriangle } from "react-icons/fa";

interface Props {
  error?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  error,
  message,
  onRetry,
  className = "",
}: Props) {
  const displayMessage = error
    ? `Gagal memuat data: ${error}`
    : message || "Terjadi kesalahan.";

  return (
    <div className={`text-center py-4 text-red-500 ${className}`}>
      <FaExclamationTriangle className="inline-block mr-2" />
      <span>{displayMessage}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 underline text-sm hover:text-red-700"
        >
          Coba lagi
        </button>
      )}
    </div>
  );
}
