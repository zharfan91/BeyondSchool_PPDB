"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-high-elevation">
      <CardHeader className="items-center text-center pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-headline-md">
          {sent ? "Cek Email Anda" : "Lupa Password"}
        </CardTitle>
        <CardDescription>
          {sent
            ? "Kami telah mengirim tautan reset password ke email Anda"
            : "Masukkan email untuk menerima tautan reset password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              Jika email terdaftar di sistem, tautan reset akan dikirim dalam beberapa menit.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Kembali ke Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Tautan Reset"}
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-3 w-3" />
                Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
