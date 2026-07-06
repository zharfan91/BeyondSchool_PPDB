"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetLoadingSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetLoadingSkeleton() {
  return (
    <Card className="border-0 shadow-high-elevation">
      <CardContent className="pt-6 text-center">
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </CardContent>
    </Card>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget as HTMLFormElement;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }
    if (!token) return;
    setLoading(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    if (resetError) {
      setError(resetError.message || "Tautan reset tidak valid atau telah kedaluwarsa");
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  };

  if (!token) {
    return (
      <Card className="border-0 shadow-high-elevation">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Tautan reset tidak valid atau telah kedaluwarsa.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/forgot-password">Minta Tautan Baru</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-high-elevation">
      <CardHeader className="items-center text-center pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-headline-md">
          {done ? "Password Berhasil Diubah" : "Reset Password"}
        </CardTitle>
        <CardDescription>
          {done ? "Silakan login dengan password baru Anda" : "Masukkan password baru Anda"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password Baru</label>
              <Input
                name="password"
                type="password"
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Konfirmasi Password</label>
              <Input
                name="confirm"
                type="password"
                placeholder="Ulangi password baru"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Simpan Password Baru"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
