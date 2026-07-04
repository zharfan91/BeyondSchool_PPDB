import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/data/status-badge";
import { Users, FileText, DollarSign, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard Admin"
        description="Overview sistem PPDB Beyond School"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Pendaftar"
          value="1,234"
          trend={{ value: 12, isPositive: true }}
          icon={Users}
        />
        <StatCard
          title="Menunggu Verifikasi"
          value="89"
          trend={{ value: 5, isPositive: false }}
          icon={FileText}
        />
        <StatCard
          title="Total Pendapatan"
          value="Rp 185 Juta"
          trend={{ value: 8, isPositive: true }}
          icon={DollarSign}
        />
        <StatCard
          title="Daya Tampung"
          value="75%"
          trend={{ value: 3, isPositive: true }}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Pendaftar Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Ahmad Fauzi", no: "PPDB/2026/00001", status: "VERIFIED" },
                { name: "Siti Nurhaliza", no: "PPDB/2026/00002", status: "SUBMITTED" },
                { name: "Budi Santoso", no: "PPDB/2026/00003", status: "DRAFT" },
                { name: "Dewi Lestari", no: "PPDB/2026/00004", status: "COMPLETED" },
              ].map((item) => (
                <div
                  key={item.no}
                  className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.no}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Distribusi Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { program: "IPA", total: 500, filled: 420 },
                { program: "IPS", total: 400, filled: 310 },
                { program: "BAHASA", total: 200, filled: 145 },
              ].map((p) => {
                const pct = Math.round((p.filled / p.total) * 100);
                return (
                  <div key={p.program}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{p.program}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.filled}/{p.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
