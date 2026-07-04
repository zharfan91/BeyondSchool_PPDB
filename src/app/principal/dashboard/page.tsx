import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/data/kpi-card";
import { Users, TrendingUp, Award, DollarSign } from "lucide-react";

export default function PrincipalDashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard Kepala Sekolah"
        description="Ringkasan eksekutif PPDB Beyond School"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Pendaftar" value="1,234" trend={{ value: 12, isPositive: true }} icon={Users} />
        <StatCard title="Diterima" value="890" trend={{ value: 72, isPositive: true }} icon={Award} />
        <StatCard title="Realisasi" value="85%" icon={TrendingUp} />
        <StatCard title="Pendapatan" value="Rp 185 Jt" icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Ringkasan Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard label="IPA" value="420" subValue="dari 500 kuota" />
              <KpiCard label="IPS" value="310" subValue="dari 400 kuota" />
              <KpiCard label="BAHASA" value="145" subValue="dari 200 kuota" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Aksi Diperlukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Persetujuan Seleksi", desc: "Menunggu approval hasil seleksi akhir", urgent: true },
                { title: "Laporan Akhir", desc: "Generate laporan PPDB untuk diserahkan ke yayasan", urgent: false },
              ].map((item, i) => (
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
