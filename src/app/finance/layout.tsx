import { MainLayout } from "@/components/layout/main-layout";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
