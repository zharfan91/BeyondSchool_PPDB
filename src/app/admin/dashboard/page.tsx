"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/data/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Users, FileText, DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AdminStats {
  totalApplicants: number;
  pendingVerification: number;
  totalRevenue: number;
  capacityPct: number;
  programDistribution: { program: string; total: number; filled: number }[];
  recent: { name: string; registrationNumber: string; status: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load admin stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <LoadingState rows={4} />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard Admin"
        description="Overview sistem PPDB Beyond School"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Pendaftar" value={stats.totalApplicants} icon={Users} />
        <StatCard title="Menunggu Verifikasi" value={stats.pendingVerification} icon={FileText} />
        <StatCard title="Total Pendapatan" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} />
        <StatCard title="Daya Tampung" value={`${stats.capacityPct}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Pendaftar Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada pendaftar.</p>
              ) : (
                stats.recent.map((item) => (
                  <div
                    key={item.registrationNumber}
                    className="flex items-center justify-between rounded-md border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.registrationNumber}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Distribusi Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.programDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data kuota.</p>
              ) : (
                stats.programDistribution.map((p) => {
                  const pct = p.total > 0 ? Math.round((p.filled / p.total) * 100) : 0;
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
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
