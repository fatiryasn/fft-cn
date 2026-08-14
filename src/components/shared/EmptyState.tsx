import { FaInbox } from "react-icons/fa";

interface Props {
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  message = "Tidak ada data ditemukan.",
  icon = <FaInbox className="text-4xl mb-2 text-gray-400" />,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col items-center gap-2 py-12 text-gray-500 ${className}`}>
      {icon}
      <p>{message}</p>
    </div>
  );
}
