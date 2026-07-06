"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, ShieldCheck, GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { authClient } from "@/lib/auth-client";

const roles = [
  { value: "student", label: "Calon Siswa" },
  { value: "admin", label: "Administrator" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const identityLabel = role === "student" ? "NISN / Email" : "Email";
  const identityPlaceholder =
    role === "student" ? "Masukkan NISN atau email Anda" : "Masukkan email administrator";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget as HTMLFormElement;
    const identity = (form.elements.namedItem("identity") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const { error: authError } = await authClient.signIn.email({
      email: identity,
      password,
      rememberMe: remember,
    });
    if (authError) {
      setError(authError.message || "Email/NISN atau password salah");
      setLoading(false);
      return;
    }
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl.startsWith("/")) {
      router.push(callbackUrl);
      return;
    }
    router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
  };

  return (
    <div className="relative isolate w-full max-w-[480px]">
      <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 -z-10 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 -z-10 rounded-full bg-secondary-container/20 blur-3xl" />

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 md:p-10">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold leading-tight text-foreground">Selamat Datang Kembali</h1>
          <p className="text-body-md text-muted-foreground">
            Silakan masuk ke akun Anda untuk melanjutkan proses pendaftaran.
          </p>
        </div>

        <SegmentedTabs options={roles} value={role} onValueChange={setRole} className="w-full mb-8" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-danger-bg border border-danger-border p-3 text-sm text-danger">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="ml-1 block text-sm font-semibold text-foreground">{identityLabel}</label>
            <div className="group relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
              <Input
                name="identity"
                className="pl-10 py-3 h-auto bg-white focus-visible:ring-primary/20"
                placeholder={identityPlaceholder}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Lupa Password?
              </Link>
            </div>
            <div className="group relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-12 py-3 h-auto bg-white focus-visible:ring-primary/20"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-foreground"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <label htmlFor="remember" className="select-none text-sm text-muted-foreground">
              Ingat saya di perangkat ini
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="mt-4 w-full rounded-lg py-3.5 h-auto font-bold shadow-md transition-all active:scale-[0.98]"
          >
            Masuk
          </Button>
        </form>

        <div className="mt-8 border-t border-outline-variant pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
        <div className="flex cursor-default items-center gap-2 grayscale transition-all hover:grayscale-0">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-wider">Secure Portal</span>
        </div>
        <div className="h-4 w-px bg-outline-variant" />
        <div className="flex cursor-default items-center gap-2 grayscale transition-all hover:grayscale-0">
          <GraduationCap className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-wider">National Admission</span>
        </div>
      </div>
    </div>
  );
}
