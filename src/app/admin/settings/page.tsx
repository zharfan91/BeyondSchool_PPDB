import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Konfigurasi sistem PPDB"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Pengaturan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Sekolah</label>
              <Input defaultValue="Beyond School" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat Sekolah</label>
              <Input defaultValue="Jl. Pendidikan No. 1, Jakarta" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tahun Ajaran Aktif</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="2026/2027" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026/2027">2026/2027</SelectItem>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4">
              <Button>Simpan Pengaturan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Template Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Template Email Verifikasi
              </label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                defaultValue="Selamat {name}, pendaftaran Anda telah diverifikasi."
              />
            </div>
            <Button variant="outline">Simpan Template</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
