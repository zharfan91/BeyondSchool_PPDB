import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, TrendingUp, ClipboardCheck } from "lucide-react";
import { StatusBadge } from "@/components/data/status-badge";

export default function SelectionDashboard() {
  return (
    <div>
      <PageHeader
        title="Seleksi"
        description="Manajemen hasil seleksi pendaftar"
        actions={
          <Button>Proses Seleksi</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Peserta" value="1,234" icon={Users} />
        <StatCard title="Lulus" value="890" trend={{ value: 72, isPositive: true }} icon={Award} />
        <StatCard title="Cadangan" value="200" icon={ClipboardCheck} />
        <StatCard title="Tidak Lulus" value="144" trend={{ value: 12, isPositive: false }} icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-headline-md">Hasil Seleksi Per Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { program: "IPA", total: 500, passed: 380, waitlist: 70, rejected: 50 },
              { program: "IPS", total: 400, passed: 310, waitlist: 50, rejected: 40 },
              { program: "BAHASA", total: 200, passed: 200, waitlist: 0, rejected: 0 },
            ].map((p) => (
              <div key={p.program} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{p.program}</h4>
                  <span className="text-sm text-muted-foreground">Total: {p.total}</span>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status="PASSED" />
                  <span className="text-sm text-muted-foreground">{p.passed} lulus</span>
                  <StatusBadge status="WAITLIST" className="ml-2" />
                  <span className="text-sm text-muted-foreground">{p.waitlist} cadangan</span>
                  <StatusBadge status="REJECTED" className="ml-2" />
                  <span className="text-sm text-muted-foreground">{p.rejected} tidak lulus</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
