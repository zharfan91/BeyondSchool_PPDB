"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, TrendingUp, ClipboardCheck } from "lucide-react";
import { StatusBadge } from "@/components/data/status-badge";
import { LoadingState } from "@/components/shared/loading-state";

interface SelectionStats {
  totalParticipants: number;
  passed: number;
  waitlist: number;
  rejected: number;
  perProgram: { program: string; total: number; passed: number; waitlist: number; rejected: number }[];
}

export default function SelectionDashboard() {
  const [stats, setStats] = useState<SelectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadStats = () => {
    fetch("/api/selection/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load selection stats:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleProcess = async () => {
    if (
      !confirm(
        "Proses seleksi otomatis akan menetapkan status Lulus/Cadangan/Tidak Lulus untuk semua pendaftar berstatus Terverifikasi berdasarkan kuota per program. Lanjutkan?"
      )
    ) {
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/selection/process", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body?.error ?? "Gagal memproses seleksi");
        return;
      }
      alert(`Selesai: ${body.passed} lulus, ${body.waitlisted} cadangan, ${body.rejected} tidak lulus.`);
      loadStats();
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !stats) {
    return <LoadingState rows={4} />;
  }

  return (
    <div>
      <PageHeader
        title="Seleksi"
        description="Manajemen hasil seleksi pendaftar"
        actions={
          <Button onClick={handleProcess} disabled={processing}>
            {processing ? "Memproses..." : "Proses Seleksi"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Peserta" value={stats.totalParticipants} icon={Users} />
        <StatCard title="Lulus" value={stats.passed} icon={Award} />
        <StatCard title="Cadangan" value={stats.waitlist} icon={ClipboardCheck} />
        <StatCard title="Tidak Lulus" value={stats.rejected} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-headline-md">Hasil Seleksi Per Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.perProgram.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data kuota program.</p>
            ) : (
              stats.perProgram.map((p) => (
                <div key={p.program} className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{p.program}</h4>
                    <span className="text-sm text-muted-foreground">Kuota: {p.total}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <StatusBadge status="PASSED" />
                    <span className="text-sm text-muted-foreground">{p.passed} lulus</span>
                    <StatusBadge status="WAITLIST" className="ml-2" />
                    <span className="text-sm text-muted-foreground">{p.waitlist} cadangan</span>
                    <StatusBadge status="REJECTED" className="ml-2" />
                    <span className="text-sm text-muted-foreground">{p.rejected} tidak lulus</span>
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
