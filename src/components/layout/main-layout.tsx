import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="pt-navbar pl-sidebar">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
