"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";
import { Download, BarChart3, FileSpreadsheet, PieChart, TrendingUp } from "lucide-react";
import { downloadTablePdf } from "@/lib/pdf";
import { formatCurrency } from "@/lib/utils";

interface ApplicantRow {
  registrationNumber: string;
  name: string;
  program: string;
  status: string;
  submittedAt: string;
}

interface PaymentRow {
  name: string;
  invoice: string;
  paymentType: string;
  amount: number;
  status: string;
  date: string;
}

interface SelectionRow {
  program: string;
  passed: number;
  waitlist: number;
  rejected: number;
  pending: number;
}

interface ReportData {
  applicants: ApplicantRow[];
  payments: PaymentRow[];
  selectionByProgram: SelectionRow[];
}

function downloadCsv(fileName: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/data")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error("Failed to load report data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <LoadingState rows={4} />;
  }

  const handleApplicantsPdf = () => {
    downloadTablePdf({
      title: "Laporan Pendaftar",
      subtitle: `Total: ${data.applicants.length} pendaftar`,
      head: ["No. Registrasi", "Nama", "Program", "Status", "Tanggal"],
      rows: data.applicants.map((a) => [
        a.registrationNumber,
        a.name,
        a.program,
        a.status,
        new Date(a.submittedAt).toLocaleDateString("id-ID"),
      ]),
      fileName: "laporan-pendaftar.pdf",
    });
  };

  const handleExcelExport = () => {
    downloadCsv(
      "data-pendaftar.csv",
      ["No. Registrasi", "Nama", "Program", "Status", "Tanggal"],
      data.applicants.map((a) => [a.registrationNumber, a.name, a.program, a.status, new Date(a.submittedAt).toLocaleDateString("id-ID")])
    );
  };

  const handleFinancePdf = () => {
    downloadTablePdf({
      title: "Laporan Keuangan",
      subtitle: `Total transaksi: ${data.payments.length}`,
      head: ["No. Invoice", "Nama", "Jenis", "Jumlah", "Status", "Tanggal"],
      rows: data.payments.map((p) => [
        p.invoice,
        p.name,
        p.paymentType,
        formatCurrency(p.amount),
        p.status,
        new Date(p.date).toLocaleDateString("id-ID"),
      ]),
      fileName: "laporan-keuangan.pdf",
    });
  };

  const handleSelectionPdf = () => {
    downloadTablePdf({
      title: "Laporan Hasil Seleksi",
      head: ["Program", "Lulus", "Cadangan", "Tidak Lulus", "Belum Diproses"],
      rows: data.selectionByProgram.map((s) => [s.program, s.passed, s.waitlist, s.rejected, s.pending]),
      fileName: "laporan-hasil-seleksi.pdf",
    });
  };

  const reportActions = [
    { title: "Laporan Pendaftar", description: "Rekap data pendaftar per program dan status", icon: BarChart3, onClick: handleApplicantsPdf },
    { title: "Export Data Excel", description: "Download semua data pendaftar dalam format CSV (dapat dibuka di Excel)", icon: FileSpreadsheet, onClick: handleExcelExport },
  ];

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
            {reportActions.map((report, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <report.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-headline-md">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={report.onClick}>
                    <Download className="mr-2 h-4 w-4" />
                    {report.title === "Export Data Excel" ? "Download CSV" : "Download PDF"}
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
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-headline-md">Laporan Keuangan</CardTitle>
                    <p className="text-sm text-muted-foreground">Rekap pembayaran dan pemasukan</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={handleFinancePdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seleksi">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <PieChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-headline-md">Laporan Hasil Seleksi</CardTitle>
                    <p className="text-sm text-muted-foreground">Rekap hasil seleksi per program</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={handleSelectionPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
