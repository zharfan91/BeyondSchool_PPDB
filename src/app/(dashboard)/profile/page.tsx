"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { DangerZoneCard } from "@/components/shared/danger-zone-card";
import { authClient } from "@/lib/auth-client";

const notificationPrefs = [
  { key: "deadline", title: "Pengingat Batas Waktu", description: "Dapatkan pengingat sebelum batas waktu pendaftaran/pembayaran.", defaultChecked: true },
  { key: "announcement", title: "Pengumuman Terbaru", description: "Notifikasi saat ada pengumuman baru dari panitia PPDB.", defaultChecked: true },
  { key: "status", title: "Perubahan Status", description: "Notifikasi saat status pendaftaran atau seleksi berubah.", defaultChecked: false },
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [prefs, setPrefs] = useState(
    Object.fromEntries(notificationPrefs.map((p) => [p.key, p.defaultChecked]))
  );

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSaved, setAccountSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
      })
      .catch(console.error);
  }, [session?.user]);

  async function handleSaveAccount() {
    setAccountSaving(true);
    setAccountError("");
    setAccountSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setAccountError(body?.error ?? "Gagal menyimpan perubahan");
        return;
      }

      const updated = await res.json();
      setName(updated.name ?? name);
      setPhone(updated.phone ?? phone);
      setAccountSaved(true);
    } catch (error) {
      console.error("Failed to save account:", error);
      setAccountError("Gagal menyimpan perubahan");
    } finally {
      setAccountSaving(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError("");
    setPasswordSaved(false);

    if (!currentPassword) {
      setPasswordError("Password saat ini wajib diisi");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changePassword", currentPassword, newPassword }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setPasswordError(body?.error ?? "Gagal mengganti password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
    } catch (error) {
      console.error("Failed to change password:", error);
      setPasswordError("Gagal mengganti password");
    } finally {
      setPasswordSaving(false);
    }
  }

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
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={email} disabled readOnly />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nomor WhatsApp</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            {accountError && <p className="text-xs text-danger">{accountError}</p>}
            {accountSaved && !accountError && (
              <p className="text-xs text-success">Perubahan berhasil disimpan.</p>
            )}
            <div className="pt-4">
              <Button loading={accountSaving} onClick={handleSaveAccount}>
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Keamanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password Saat Ini</label>
              <PasswordInput
                placeholder="Masukkan password saat ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Baru</label>
                <PasswordInput
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Konfirmasi Password</label>
                <PasswordInput
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {passwordError && <p className="text-xs text-danger">{passwordError}</p>}
            {passwordSaved && !passwordError && (
              <p className="text-xs text-success">Password berhasil diganti.</p>
            )}
            <div className="pt-4">
              <Button variant="outline" loading={passwordSaving} onClick={handleChangePassword}>
                Ganti Password
              </Button>
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
            const res = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "deactivate" }),
            });

            if (!res.ok) {
              const body = await res.json().catch(() => ({}));
              alert(body?.error ?? "Gagal menonaktifkan akun");
              return;
            }

            await authClient.signOut();
            router.push("/login");
          }}
        />
      </div>
    </div>
  );
}
