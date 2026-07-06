"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/data/status-badge";
import { Timeline } from "@/components/data/timeline";
import { ResultHeroCard } from "@/components/shared/result-hero-card";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/data/empty-state";
import { useRouter } from "next/navigation";
import { Clock, ClipboardList } from "lucide-react";

interface DashboardSummary {
  hasApplicant: boolean;
  name?: string;
  registrationNumber?: string | null;
  programName?: string | null;
  registrationStatus?: string | null;
  selectionStatus?: string | null;
}

const SELECTION_TO_HERO: Record<string, "accepted" | "rejected" | "pending"> = {
  PASSED: "accepted",
  REJECTED: "rejected",
  WAITLIST: "pending",
  PENDING: "pending",
  APPEALED: "pending",
};

const REGISTRATION_STEPS = [
  { key: "SUBMITTED", title: "Pendaftaran", description: "Formulir telah diisi" },
  { key: "VERIFIED", title: "Verifikasi Berkas", description: "Berkas sedang diperiksa" },
  { key: "PAYMENT", title: "Pembayaran", description: "Menunggu konfirmasi pembayaran" },
  { key: "SELECTION", title: "Seleksi", description: "Proses seleksi akademik" },
  { key: "COMPLETED", title: "Pengumuman", description: "Hasil akhir seleksi" },
];

function stepStatusFor(index: number, registrationStatus: string | null | undefined, selectionStatus: string | null | undefined) {
  const order = ["DRAFT", "SUBMITTED", "VERIFIED", "COMPLETED"];
  const currentIndex = order.indexOf(registrationStatus ?? "DRAFT");
  const stepOrder = [1, 2, 3, 4, 5];
  if (index === 4) {
    return selectionStatus && selectionStatus !== "PENDING" ? "completed" : currentIndex >= 2 ? "current" : "upcoming";
  }
  if (index === 3) {
    return selectionStatus ? "completed" : currentIndex >= 2 ? "current" : "upcoming";
  }
  if (index <= 1) {
    return currentIndex > index ? "completed" : currentIndex === index ? "current" : "upcoming";
  }
  return currentIndex >= 2 ? "completed" : "upcoming";
}

export default function StatusPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard-summary")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Failed to load status:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState rows={4} />;
  }

  if (!summary?.hasApplicant) {
    return (
      <div>
        <PageHeader title="Status Seleksi" description="Pantau status pendaftaran dan hasil seleksi" />
        <EmptyState
          icon={ClipboardList}
          title="Belum Ada Pendaftaran"
          description="Mulai isi formulir pendaftaran untuk melihat status Anda di sini."
          action={{ label: "Mulai Pendaftaran", onClick: () => router.push("/registration") }}
        />
      </div>
    );
  }

  const heroStatus = summary.selectionStatus
    ? SELECTION_TO_HERO[summary.selectionStatus] ?? "pending"
    : "pending";
  const heroMessage =
    heroStatus === "accepted"
      ? "Selamat! Anda dinyatakan lulus seleksi. Silakan lanjutkan ke tahap daftar ulang."
      : heroStatus === "rejected"
      ? "Mohon maaf, Anda belum berhasil pada seleksi kali ini."
      : "Berkas Anda sedang dalam proses verifikasi dan seleksi. Hasil akan diumumkan sesuai jadwal yang tertera pada linimasa pendaftaran.";

  return (
    <div>
      <PageHeader
        title="Status Seleksi"
        description="Pantau status pendaftaran dan hasil seleksi"
      />

      <ResultHeroCard
        status={heroStatus}
        name={summary.name ?? ""}
        message={heroMessage}
        actions={[{ label: "Lihat Panduan Seleksi", href: "/faq", variant: "outline" }]}
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-headline-md">Alur Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              steps={REGISTRATION_STEPS.map((step, i) => ({
                title: step.title,
                description: step.description,
                status: stepStatusFor(i, summary.registrationStatus, summary.selectionStatus) as "completed" | "current" | "upcoming",
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-label-md text-muted-foreground">Status Pendaftaran</p>
              <StatusBadge status={summary.registrationStatus ?? "DRAFT"} className="mt-1" />
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">No. Registrasi</p>
              <p className="font-mono text-sm mt-1">{summary.registrationNumber ?? "-"}</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Program</p>
              <p className="font-medium mt-1">{summary.programName ?? "-"}</p>
            </div>
            <div className="rounded-md bg-info-bg border border-info-border p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-info mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-info">Pengumuman</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pengumuman hasil seleksi akan disampaikan melalui halaman ini dan email Anda.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
