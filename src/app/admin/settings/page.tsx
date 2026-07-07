"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { ROLES } from "@/lib/constants";

interface Period {
  id: string;
  name: string;
  isActive: boolean;
}

interface SchoolSettings {
  id: string;
  schoolName: string;
  schoolAddress: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  emailVerificationTemplate: string;
}

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const isSuperAdmin = (session?.user as { role?: string } | undefined)?.role === ROLES.SUPER_ADMIN;

  const [periods, setPeriods] = useState<Period[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedPeriod, setSavedPeriod] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/periods").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([periodsData, settingsData]: [Period[], SchoolSettings]) => {
        setPeriods(periodsData);
        const active = periodsData.find((p) => p.isActive);
        if (active) setActiveId(active.id);
        setSettings(settingsData);
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveActivePeriod = async () => {
    if (!activeId) return;
    setSavingPeriod(true);
    setSavedPeriod(false);
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
      setSavedPeriod(true);
    } finally {
      setSavingPeriod(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    setSavedSettings(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body?.error ?? "Gagal menyimpan pengaturan");
        return;
      }
      setSettings(body);
      setSavedSettings(true);
    } finally {
      setSavingSettings(false);
    }
  };

  const update = (key: keyof SchoolSettings, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
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
            {loading || !settings ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Sekolah</label>
                  <Input value={settings.schoolName} disabled={!isSuperAdmin} onChange={(e) => update("schoolName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alamat Sekolah</label>
                  <Input value={settings.schoolAddress} disabled={!isSuperAdmin} onChange={(e) => update("schoolAddress", e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Bank</label>
                    <Input value={settings.bankName} disabled={!isSuperAdmin} onChange={(e) => update("bankName", e.target.value)} placeholder="Bank Mandiri" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">No. Rekening</label>
                    <Input value={settings.bankAccountNumber} disabled={!isSuperAdmin} onChange={(e) => update("bankAccountNumber", e.target.value)} placeholder="123-00-4567890-1" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Atas Nama</label>
                    <Input value={settings.bankAccountHolder} disabled={!isSuperAdmin} onChange={(e) => update("bankAccountHolder", e.target.value)} placeholder="Yayasan Beyond School" />
                  </div>
                </div>
                {isSuperAdmin ? (
                  <div className="pt-2 flex items-center gap-3">
                    <Button onClick={handleSaveSettings} disabled={savingSettings}>
                      {savingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
                    </Button>
                    {savedSettings && <span className="text-sm text-success">Tersimpan</span>}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Hanya Super Admin yang dapat mengubah pengaturan ini.
                  </p>
                )}
              </>
            )}

            <div className="space-y-2 pt-4 border-t border-border">
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
            <div className="pt-2 flex items-center gap-3">
              <Button onClick={handleSaveActivePeriod} disabled={savingPeriod || !activeId}>
                {savingPeriod ? "Menyimpan..." : "Simpan Periode Aktif"}
              </Button>
              {savedPeriod && <span className="text-sm text-success">Tersimpan</span>}
            </div>
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
                className="flex min-h-[120px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm disabled:opacity-60"
                value={settings?.emailVerificationTemplate ?? ""}
                disabled={!isSuperAdmin || loading}
                onChange={(e) => update("emailVerificationTemplate", e.target.value)}
                placeholder="Selamat {name}, pendaftaran Anda telah diverifikasi."
              />
            </div>
            {isSuperAdmin ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? "Menyimpan..." : "Simpan Template"}
                </Button>
                {savedSettings && <span className="text-sm text-success">Tersimpan</span>}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Hanya Super Admin yang dapat mengubah template ini.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Template ini tersimpan di database tapi belum dikirim otomatis oleh sistem manapun — belum ada alur yang memicu email verifikasi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
