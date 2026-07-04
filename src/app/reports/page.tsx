import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, BarChart3, FileSpreadsheet, PieChart, TrendingUp } from "lucide-react";

const reports = [
  { title: "Laporan Pendaftar", description: "Rekap data pendaftar per program dan status", icon: BarChart3 },
  { title: "Laporan Keuangan", description: "Rekap pembayaran dan pemasukan", icon: TrendingUp },
  { title: "Laporan Hasil Seleksi", description: "Rekap hasil seleksi per program", icon: PieChart },
  { title: "Export Data Excel", description: "Download semua data pendaftar dalam format Excel", icon: FileSpreadsheet },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Generate dan download laporan PPDB"
      />

      <Tabs defaultValue="pendaftar">
        <TabsList className="mb-6">
          <TabsTrigger value="pendaftar">Pendaftar</TabsTrigger>
          <TabsTrigger value="keuangan">Keuangan</TabsTrigger>
          <TabsTrigger value="seleksi">Seleksi</TabsTrigger>
        </TabsList>

        <TabsContent value="pendaftar">
          <div className="grid gap-4 sm:grid-cols-2">
            {reports.slice(0, 2).map((report, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <report.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-headline-md">{report.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="keuangan">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-headline-md">Laporan Keuangan</CardTitle>
                <p className="text-sm text-muted-foreground">Rekap pembayaran dan pemasukan</p>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seleksi">
          <div className="grid gap-4 sm:grid-cols-2">
            {reports.slice(2).map((report, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-headline-md">{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
