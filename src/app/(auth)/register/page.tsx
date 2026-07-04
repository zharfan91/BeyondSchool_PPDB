"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;
    if (password !== confirm) {
      setError("Password dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }
    const { error: authError } = await authClient.signUp.email({ email, password, name });
    if (authError) {
      setError(authError.message || "Gagal mendaftar");
      setLoading(false);
      return;
    }
    router.push("/login");
  };

  return (
    <Card className="border-0 shadow-high-elevation">
      <CardHeader className="items-center text-center pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-headline-md">Buat Akun Baru</CardTitle>
        <CardDescription>
          Daftar untuk memulai pendaftaran PPDB Online
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nama Lengkap</label>
            <Input name="name" placeholder="Nama sesuai identitas" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input name="email" type="email" placeholder="nama@email.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nomor WhatsApp</label>
            <Input name="phone" type="tel" placeholder="081234567890" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input name="password" type="password" placeholder="Minimal 8 karakter" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Konfirmasi Password</label>
            <Input name="confirm" type="password" placeholder="Ulangi password" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Masuk di sini
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
