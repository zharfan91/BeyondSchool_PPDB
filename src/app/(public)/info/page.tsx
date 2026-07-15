import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, FileText, Clock, CheckCircle } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-display text-foreground mb-4">Informasi PPDB</h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
          Informasi lengkap mengenai Penerimaan Peserta Didik Baru Beyond School
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-primary" />
              <CardTitle className="text-headline-md">Jadwal Penting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { event: "Pendaftaran Dibuka", date: "1 Juni 2026" },
                { event: "Pendaftaran Ditutup", date: "31 Juli 2026" },
                { event: "Verifikasi Berkas", date: "1-5 Agustus 2026" },
                { event: "Pengumuman Hasil", date: "15 Agustus 2026" },
                { event: "Daftar Ulang", date: "16-20 Agustus 2026" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="text-sm font-medium">{item.event}</span>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-headline-md">Persyaratan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Warga Negara Indonesia",
                "Usia maksimal 18 tahun per 1 Juli 2026",
                "Lulusan SMP/Sederajat",
                "Sehat jasmani dan rohani",
                "Tidak buta warna (untuk jurusan tertentu)",
                "Melengkapi dokumen persyaratan yang ditentukan",
              ].map((req, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <CardTitle className="text-headline-md">Jalur Pendaftaran</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Jalur Zonasi", desc: "Berdasarkan radius tempat tinggal", kuota: "40%" },
                { name: "Jalur Prestasi", desc: "Nilai raport dan prestasi akademik/non-akademik", kuota: "30%" },
                { name: "Jalur Afirmasi", desc: "Siswa kurang mampu dan disabilitas", kuota: "20%" },
                { name: "Jalur Perpindahan", desc: "Anak guru dan perpindahan tugas orang tua", kuota: "10%" },
              ].map((jalur, i) => (
                <div key={i} className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{jalur.name}</h4>
                    <span className="text-sm text-primary font-medium">Kuota: {jalur.kuota}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{jalur.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
