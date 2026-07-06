"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/data/kpi-card";
import { LoadingState } from "@/components/shared/loading-state";
import { Users, TrendingUp, Award, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PrincipalStats {
  totalApplicants: number;
  passed: number;
  realizationPct: number;
  totalRevenue: number;
  programSummary: { program: string; filled: number; total: number }[];
  awaitingDecision: number;
}

export default function PrincipalDashboard() {
  const [stats, setStats] = useState<PrincipalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/principal/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load principal stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <LoadingState rows={4} />;
  }

  const actions = [
    ...(stats.awaitingDecision > 0
      ? [{ title: "Persetujuan Seleksi", desc: `${stats.awaitingDecision} pendaftar menunggu keputusan akhir`, urgent: true }]
      : []),
    { title: "Laporan Akhir", desc: "Generate laporan PPDB untuk diserahkan ke yayasan", urgent: false },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard Kepala Sekolah"
        description="Ringkasan eksekutif PPDB Beyond School"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Pendaftar" value={stats.totalApplicants} icon={Users} />
        <StatCard title="Diterima" value={stats.passed} icon={Award} />
        <StatCard title="Realisasi" value={`${stats.realizationPct}%`} icon={TrendingUp} />
        <StatCard title="Pendapatan" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Ringkasan Program</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.programSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data kuota.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.programSummary.map((p) => (
                  <KpiCard key={p.program} label={p.program} value={p.filled} subValue={`dari ${p.total} kuota`} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Aksi Diperlukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actions.map((item, i) => (
                <div
                  key={i}
                  className={`rounded-md border p-4 ${item.urgent ? "border-danger/30 bg-danger-bg" : "border-border"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                    {item.urgent && (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
