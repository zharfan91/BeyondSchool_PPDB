"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/data/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Plus } from "lucide-react";

interface ProgramQuota {
  id: string;
  totalQuota: number;
  filledQuota: number;
  program: { name: string };
}

interface Period {
  id: string;
  name: string;
  year: number;
  semester: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  programQuotas: ProgramQuota[];
}

const emptyDraft = { name: "", year: new Date().getFullYear().toString(), semester: "GANJIL", startDate: "", endDate: "", description: "" };

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/periods");
      const data = await res.json();
      setPeriods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load periods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, year: Number(draft.year) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal membuat periode");
        return;
      }
      setDraft(emptyDraft);
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch("/api/periods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal mengaktifkan periode");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Periode & Kuota"
        description="Atur periode pendaftaran dan kuota program"
        actions={
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Periode
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-headline-md">Periode Baru</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Periode</label>
              <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="TA 2027/2028 - Ganjil" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun</label>
              <Input type="number" value={draft.year} onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select value={draft.semester} onValueChange={(v) => setDraft((d) => ({ ...d, semester: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GANJIL">Ganjil</SelectItem>
                  <SelectItem value="GENAP">Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div />
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Input type="date" value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <Input type="date" value={draft.endDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button onClick={handleCreate} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Periode"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <LoadingState rows={3} />
      ) : periods.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Belum ada periode pendaftaran.</p>
      ) : (
        <div className="grid gap-6">
          {periods.map((period) => (
            <Card key={period.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-headline-md">{period.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(period.startDate).toLocaleDateString("id-ID")} - {new Date(period.endDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                {period.isActive ? (
                  <StatusBadge status="VERIFIED" />
                ) : (
                  <Button variant="outline" size="sm" disabled={busyId === period.id} onClick={() => handleActivate(period.id)}>
                    {busyId === period.id ? "Memproses..." : "Aktifkan"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {period.programQuotas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada kuota program untuk periode ini.</p>
                  ) : (
                    period.programQuotas.map((p) => {
                      const pct = p.totalQuota > 0 ? Math.round((p.filledQuota / p.totalQuota) * 100) : 0;
                      return (
                        <div key={p.id} className="flex items-center gap-4">
                          <span className="w-24 text-sm font-medium">{p.program.name}</span>
                          <div className="flex-1 h-2 rounded-full bg-surface-container">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm text-muted-foreground w-24 text-right">
                            {p.filledQuota}/{p.totalQuota}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
