import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApplicantDetailPage() {
  return (
    <div>
      <PageHeader
        title="Detail Pendaftar"
        description="PPDB/2026/00001 - Ahmad Fauzi"
        actions={
          <>
            <Button variant="outline">Catatan</Button>
            <Button>Verifikasi</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Data Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-label-md text-muted-foreground">Nama Lengkap</p>
              <p className="text-body-md font-medium">Ahmad Fauzi</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Tempat, Tgl Lahir</p>
              <p className="text-body-md font-medium">Jakarta, 15 Mei 2008</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Jenis Kelamin</p>
              <p className="text-body-md font-medium">Laki-laki</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Agama</p>
              <p className="text-body-md font-medium">Islam</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-label-md text-muted-foreground">Status Pendaftaran</p>
              <Badge variant="success" className="mt-1">Terverifikasi</Badge>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Program</p>
              <p className="text-body-md font-medium">IPA</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Tanggal Daftar</p>
              <p className="text-body-md font-medium">15 Juni 2026</p>
            </div>
            <div>
              <p className="text-label-md text-muted-foreground">Berkas</p>
              <p className="text-body-md font-medium">3/5 terupload</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Berkas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Akte Kelahiran", "Kartu Keluarga", "Pas Foto"].map((doc) => (
              <div
                key={doc}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm">{doc}</span>
                <Badge variant="success">Ada</Badge>
              </div>
            ))}
            {["Raport", "Ijazah"].map((doc) => (
              <div
                key={doc}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm">{doc}</span>
                <Badge variant="warning">Belum</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
