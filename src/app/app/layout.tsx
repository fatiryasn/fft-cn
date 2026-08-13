import AppShell from "@/components/layout/AppShell";
import { TitleProvider } from "@/context/TitleContext";
import { requireUser } from "@/services/auth.service";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <TitleProvider>
      <AppShell>{children}</AppShell>
    </TitleProvider>
  );
}
