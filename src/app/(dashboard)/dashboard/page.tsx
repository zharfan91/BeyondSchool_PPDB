"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroBanner } from "@/components/shared/hero-banner";
import { StatCard } from "@/components/data/stat-card";
import { Timeline } from "@/components/data/timeline";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/data/empty-state";
import { authClient } from "@/lib/auth-client";
import { Users, FileText, Clock, CheckCircle, ClipboardList } from "lucide-react";

const REGISTRATION_LABELS: Record<string, string> = {
  DRAFT: "Draf",
  SUBMITTED: "Terkirim",
  VERIFIED: "Terverifikasi",
  INCOMPLETE: "Belum Lengkap",
  COMPLETED: "Selesai",
};

const STEP_TITLES = ["Data Pribadi", "Alamat", "Data Orang Tua", "Data Akademik", "Upload Dokumen"];

interface DashboardSummary {
  hasApplicant: boolean;
  name?: string;
  registrationStatus?: string | null;
  stepCompleted?: number;
  documents?: { total: number; verified: number };
  payments?: { total: number; paid: number };
}

export default function ApplicantDashboard() {
  return (
    <Suspense fallback={<LoadingState rows={4} />}>
      <ApplicantDashboardContent />
    </Suspense>
  );
}

function ApplicantDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUnauthorized, setShowUnauthorized] = useState(searchParams.get("error") === "unauthorized");

  useEffect(() => {
    fetch("/api/dashboard-summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Failed to load dashboard summary:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState rows={4} />;
  }

  const name = summary?.name ?? session?.user?.name ?? "";

  if (!summary?.hasApplicant) {
    return (
      <div>
        {showUnauthorized && (
          <div className="mb-6 rounded-lg bg-danger-bg border border-danger-border p-3 text-sm text-danger flex items-center justify-between">
            Anda tidak memiliki akses ke halaman tersebut.
            <button onClick={() => setShowUnauthorized(false)} className="ml-4 font-medium">
              Tutup
            </button>
          </div>
        )}
        <HeroBanner
          name={name}
          subtitle="Anda belum memulai pendaftaran. Lengkapi formulir untuk mengikuti proses seleksi PPDB."
          primaryAction={{ label: "Mulai Pendaftaran", href: "/registration" }}
          secondaryAction={{ label: "Panduan Seleksi", href: "/faq" }}
          className="mb-8"
        />
        <EmptyState
          icon={ClipboardList}
          title="Belum Ada Pendaftaran"
          description="Mulai isi formulir pendaftaran untuk melihat progres dan status Anda di sini."
          action={{ label: "Mulai Sekarang", onClick: () => router.push("/registration") }}
        />
      </div>
    );
  }

  const stepCompleted = summary.stepCompleted ?? 0;
  const documents = summary.documents ?? { total: 0, verified: 0 };
  const payments = summary.payments ?? { total: 0, paid: 0 };

  return (
    <div>
      {showUnauthorized && (
        <div className="mb-6 rounded-lg bg-danger-bg border border-danger-border p-3 text-sm text-danger flex items-center justify-between">
          Anda tidak memiliki akses ke halaman tersebut.
          <button onClick={() => setShowUnauthorized(false)} className="ml-4 font-medium">
            Tutup
          </button>
        </div>
      )}
      <HeroBanner
        name={name}
        subtitle="Lengkapi sisa langkah pendaftaran Anda untuk melanjutkan proses seleksi."
        primaryAction={{ label: "Lengkapi Formulir", href: "/registration" }}
        secondaryAction={{ label: "Panduan Seleksi", href: "/faq" }}
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Status Pendaftaran"
          value={REGISTRATION_LABELS[summary.registrationStatus ?? "DRAFT"] ?? "Draf"}
          icon={FileText}
        />
        <StatCard
          title="Berkas Terverifikasi"
          value={`${documents.verified}/${documents.total}`}
          icon={Clock}
        />
        <StatCard
          title="Pembayaran"
          value={payments.total === 0 ? "Belum" : `${payments.paid}/${payments.total} Lunas`}
          icon={Users}
        />
        <StatCard
          title="Pengumuman"
          value="-"
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-headline-md">Progress Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              steps={STEP_TITLES.map((title, i) => ({
                title,
                status: i < stepCompleted ? "completed" : i === stepCompleted ? "current" : "upcoming",
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-info-bg border border-info-border p-3">
                <p className="text-sm font-medium text-info">Pendaftaran Dibuka</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pendaftaran PPDB 2026/2027 telah dibuka. Segera lengkapi data Anda.
                </p>
              </div>
              <div className="rounded-lg bg-surface-container p-3">
                <p className="text-sm font-medium text-foreground">Jadwal Seleksi</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jadwal seleksi akan diumumkan setelah masa pendaftaran ditutup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
