"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/data/status-badge";
import { Plus } from "lucide-react";

export default function PeriodsPage() {
  return (
    <div>
      <PageHeader
        title="Periode & Kuota"
        description="Atur periode pendaftaran dan kuota program"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Periode
          </Button>
        }
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-headline-md">TA 2026/2027 - Ganjil</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                1 Juni 2026 - 31 Juli 2026
              </p>
            </div>
            <StatusBadge status="VERIFIED" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { program: "IPA", quota: 200, filled: 180 },
                { program: "IPS", quota: 150, filled: 120 },
                { program: "BAHASA", quota: 100, filled: 65 },
              ].map((p) => {
                const pct = Math.round((p.filled / p.quota) * 100);
                return (
                  <div key={p.program} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">{p.program}</span>
                    <div className="flex-1 h-2 rounded-full bg-surface-container">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-24 text-right">
                      {p.filled}/{p.quota}
                    </span>
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
