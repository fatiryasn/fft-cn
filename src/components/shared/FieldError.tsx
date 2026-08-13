interface FieldErrorProps {
  message?: string;
  className?: string;
}

export default function FieldError({
  message,
  className = "",
}: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className={`text-red-500 text-xs md:text-sm ${className}`}>{message}</p>
  );
}
