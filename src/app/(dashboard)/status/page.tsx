import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/data/status-badge";
import { Timeline } from "@/components/data/timeline";
import { ResultHeroCard } from "@/components/shared/result-hero-card";
import { Clock } from "lucide-react";

export default function StatusPage() {
  return (
    <div>
      <PageHeader
        title="Status Seleksi"
        description="Pantau status pendaftaran dan hasil seleksi"
      />

      <ResultHeroCard
        status="pending"
        name="Ahmad Fauzi"
        message="Berkas Anda sedang dalam proses verifikasi dan seleksi. Hasil akan diumumkan sesuai jadwal yang tertera pada linimasa pendaftaran."
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
              steps={[
                { title: "Pendaftaran", description: "Formulir telah diisi", status: "completed" },
                { title: "Verifikasi Berkas", description: "Berkas sedang diperiksa", status: "completed" },
                { title: "Pembayaran", description: "Menunggu konfirmasi pembayaran", status: "current" },
                { title: "Seleksi", description: "Proses seleksi akademik", status: "upcoming" },
                { title: "Pengumuman", description: "Hasil akhir seleksi", status: "upcoming" },
              ]}
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
              <StatusBadge status="VERIFIED" className="mt-1" />
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">No. Registrasi</p>
              <p className="font-mono text-sm mt-1">PPDB/2026/00001</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Program</p>
              <p className="font-medium mt-1">IPA</p>
            </div>
            <div className="rounded-md bg-info-bg border border-info-border p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-info mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-info">Pengumuman</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pengumuman hasil seleksi: 15 Juli 2026
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
