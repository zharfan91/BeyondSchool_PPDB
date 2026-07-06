"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface Applicant {
  id: string;
  registrationNumber: string;
  name: string;
  program: string;
  status: string;
  submittedAt: string;
}

const columns: Column<Applicant>[] = [
  {
    key: "registrationNumber",
    header: "No. Registrasi",
    sortable: true,
    cell: (row) => <span className="font-mono text-sm">{row.registrationNumber}</span>,
  },
  {
    key: "name",
    header: "Nama",
    sortable: true,
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "program",
    header: "Program",
    cell: (row) => <span>{row.program}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "submittedAt",
    header: "Tanggal Daftar",
    sortable: true,
    cell: (row) => <span className="text-muted-foreground">{row.submittedAt}</span>,
  },
];

function toCsv(rows: Applicant[]) {
  const headers = ["No. Registrasi", "Nama", "Program", "Status", "Tanggal Daftar"];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((row) =>
    [row.registrationNumber, row.name, row.program, row.status, row.submittedAt]
      .map((value) => escape(String(value)))
      .join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

export default function StaffApplicantsPage() {
  const router = useRouter();
  const [data, setData] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/applicants")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat data pendaftar. Silakan coba lagi.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const csv = toCsv(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "data-pendaftar.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Data Pendaftar"
        description="Kelola semua data pendaftar PPDB"
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              disabled
              title="Pendaftaran dibuat oleh calon siswa melalui portalnya sendiri"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          </>
        }
      />
      {error && (
        <div className="mb-4 rounded-lg bg-danger-bg border border-danger-border p-3 text-sm text-danger">
          {error}
        </div>
      )}
      {loading ? (
        <LoadingState />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchable
          searchKeys={["name", "registrationNumber"]}
          onRowClick={(row) => router.push(`/staff/applicants/${row.id}`)}
        />
      )}
    </div>
  );
}
