import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroBanner } from "@/components/shared/hero-banner";
import { StatCard } from "@/components/data/stat-card";
import { Timeline } from "@/components/data/timeline";
import { Users, FileText, Clock, CheckCircle } from "lucide-react";

export default function ApplicantDashboard() {
  return (
    <div>
      <HeroBanner
        name="Ahmad Fauzi"
        subtitle="Lengkapi sisa langkah pendaftaran Anda untuk melanjutkan proses seleksi."
        primaryAction={{ label: "Lengkapi Formulir", href: "/registration" }}
        secondaryAction={{ label: "Panduan Seleksi", href: "/faq" }}
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Status Pendaftaran"
          value="Draf"
          icon={FileText}
        />
        <StatCard
          title="Berkas Terupload"
          value="0/5"
          icon={Clock}
        />
        <StatCard
          title="Pembayaran"
          value="Belum"
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
              steps={[
                { title: "Data Pribadi", description: "Lengkapi data diri Anda", status: "current" },
                { title: "Alamat", description: "Alamat tempat tinggal", status: "upcoming" },
                { title: "Data Orang Tua", description: "Informasi orang tua/wali", status: "upcoming" },
                { title: "Data Akademik", description: "Riwayat pendidikan", status: "upcoming" },
                { title: "Upload Dokumen", description: "Unggah persyaratan", status: "upcoming" },
              ]}
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
