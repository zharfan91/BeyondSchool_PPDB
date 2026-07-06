import { MainLayout } from "@/components/layout/main-layout";

export default function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
