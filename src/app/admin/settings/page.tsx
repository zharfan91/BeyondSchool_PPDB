"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Period {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/periods")
      .then((res) => res.json())
      .then((data: Period[]) => {
        setPeriods(data);
        const active = data.find((p) => p.isActive);
        if (active) setActiveId(active.id);
      })
      .catch((err) => console.error("Failed to load periods:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveActivePeriod = async () => {
    if (!activeId) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/periods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeId, isActive: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal menyimpan periode aktif");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Konfigurasi sistem PPDB"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Pengaturan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Sekolah</label>
              <Input defaultValue="Beyond School" disabled title="Belum ada model pengaturan sekolah di database" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat Sekolah</label>
              <Input defaultValue="Jl. Pendidikan No. 1, Jakarta" disabled title="Belum ada model pengaturan sekolah di database" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun Ajaran Aktif</label>
              {loading ? (
                <p className="text-sm text-muted-foreground">Memuat...</p>
              ) : (
                <Select value={activeId} onValueChange={setActiveId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih periode" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="pt-4 flex items-center gap-3">
              <Button onClick={handleSaveActivePeriod} disabled={saving || !activeId}>
                {saving ? "Menyimpan..." : "Simpan Periode Aktif"}
              </Button>
              {saved && <span className="text-sm text-success">Tersimpan</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              Nama dan alamat sekolah belum dapat diubah karena belum ada model pengaturan di database.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Template Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Template Email Verifikasi
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                defaultValue="Selamat {name}, pendaftaran Anda telah diverifikasi."
                disabled
                title="Belum ada layanan pengiriman email terpasang"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Template email belum dapat disimpan karena belum ada layanan pengiriman email yang terpasang.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
