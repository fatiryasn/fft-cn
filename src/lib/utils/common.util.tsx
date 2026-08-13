export const formatDate = (
  dateString: string,
  includeTime: boolean = true,
): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!includeTime) return formattedDate;

  const formattedTime = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${formattedDate} - ${formattedTime}`;
};

export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);

export const getCurrentDatetime = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

// Helper to convert UTC ISO string to local date (YYYY-MM-DD) and time (HH:MM)
export const parseLocalDateTime = (
  utcString: string,
): { date: string; time: string } => {
  const localDate = new Date(utcString);
  if (isNaN(localDate.getTime())) return { date: "", time: "" };
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");
  return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
};

// Helper to build ISO string from local date and time
export const buildISOString = (date: string, time: string): string => {
  const combined = `${date}T${time}:00`;
  return new Date(combined).toISOString();
};
