"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { DangerZoneCard } from "@/components/shared/danger-zone-card";

const notificationPrefs = [
  { key: "deadline", title: "Pengingat Batas Waktu", description: "Dapatkan pengingat sebelum batas waktu pendaftaran/pembayaran.", defaultChecked: true },
  { key: "announcement", title: "Pengumuman Terbaru", description: "Notifikasi saat ada pengumuman baru dari panitia PPDB.", defaultChecked: true },
  { key: "status", title: "Perubahan Status", description: "Notifikasi saat status pendaftaran atau seleksi berubah.", defaultChecked: false },
];

export default function ProfilePage() {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(notificationPrefs.map((p) => [p.key, p.defaultChecked]))
  );

  return (
    <div>
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi akun Anda"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Data Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input defaultValue="Ahmad Fauzi" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue="ahmad@email.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nomor WhatsApp</label>
                <Input defaultValue="081234567890" />
              </div>
            </div>
            <div className="pt-4">
              <Button>Simpan Perubahan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Keamanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Baru</label>
                <PasswordInput placeholder="Minimal 8 karakter" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Konfirmasi Password</label>
                <PasswordInput placeholder="Ulangi password baru" />
              </div>
            </div>
            <div className="pt-4">
              <Button variant="outline">Ganti Password</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Preferensi Notifikasi</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {notificationPrefs.map((pref) => (
              <div key={pref.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{pref.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                </div>
                <Switch
                  checked={prefs[pref.key]}
                  onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [pref.key]: checked }))}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <DangerZoneCard
          description="Setelah akun dinonaktifkan, Anda tidak dapat lagi mengakses data pendaftaran ini. Tindakan ini tidak dapat dibatalkan."
          actionLabel="Nonaktifkan Akun"
          confirmTitle="Nonaktifkan akun ini?"
          confirmDescription="Semua data pendaftaran Anda akan diarsipkan dan akun tidak dapat digunakan kembali."
          onConfirm={async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }}
        />
      </div>
    </div>
  );
}
