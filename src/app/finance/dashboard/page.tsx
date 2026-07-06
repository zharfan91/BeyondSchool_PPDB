"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { DollarSign, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinanceStats {
  totalIncome: number;
  paidCount: number;
  pendingCount: number;
  targetPct: number;
}

interface PaymentRow {
  name: string;
  invoice: string;
  amount: number;
  status: string;
  date: string;
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [recent, setRecent] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/finance/stats").then((r) => r.json()),
      fetch("/api/finance/payments").then((r) => r.json()),
    ])
      .then(([statsData, paymentsData]) => {
        setStats(statsData);
        setRecent((paymentsData ?? []).slice(0, 5));
      })
      .catch((err) => console.error("Failed to load finance dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <LoadingState rows={4} />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard Keuangan"
        description="Overview pembayaran PPDB"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Pemasukan" value={formatCurrency(stats.totalIncome)} icon={DollarSign} />
        <StatCard title="Lunas" value={stats.paidCount} icon={CreditCard} />
        <StatCard title="Menunggu" value={stats.pendingCount} icon={AlertTriangle} />
        <StatCard title="Target Tercapai" value={`${stats.targetPct}%`} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-headline-md">Riwayat Pembayaran Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada pembayaran.</p>
            ) : (
              recent.map((p) => (
                <div key={p.invoice} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.invoice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(p.amount)}</p>
                    <p className={`text-xs ${p.status === "PAID" || p.status === "VERIFIED" ? "text-success" : "text-warning"}`}>
                      {p.status === "PAID" ? "Lunas" : p.status === "VERIFIED" ? "Terverifikasi" : "Menunggu"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
