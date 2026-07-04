import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";

export default function FinanceDashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard Keuangan"
        description="Overview pembayaran PPDB"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Pemasukan" value="Rp 185.000.000" trend={{ value: 12, isPositive: true }} icon={DollarSign} />
        <StatCard title="Lunas" value="823" trend={{ value: 8, isPositive: true }} icon={CreditCard} />
        <StatCard title="Menunggu" value="156" trend={{ value: 3, isPositive: false }} icon={AlertTriangle} />
        <StatCard title="Target Tercapai" value="78%" trend={{ value: 5, isPositive: true }} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-headline-md">Riwayat Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Ahmad Fauzi", invoice: "INV/2026/00001", amount: "Rp 500.000", status: "Lunas", date: "15 Jun 2026" },
              { name: "Siti Nurhaliza", invoice: "INV/2026/00002", amount: "Rp 500.000", status: "Menunggu", date: "15 Jun 2026" },
              { name: "Budi Santoso", invoice: "INV/2026/00003", amount: "Rp 500.000", status: "Lunas", date: "14 Jun 2026" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.invoice}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{p.amount}</p>
                  <p className={`text-xs ${p.status === "Lunas" ? "text-success" : "text-warning"}`}>{p.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
