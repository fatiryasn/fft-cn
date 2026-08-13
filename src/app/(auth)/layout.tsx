import { requireGuest } from "@/services/auth.service";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireGuest();

  return children;
}
