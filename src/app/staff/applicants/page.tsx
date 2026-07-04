"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface Applicant {
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

export default function StaffApplicantsPage() {
  const [data, setData] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applicants")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Data Pendaftar"
        description="Kelola semua data pendaftar PPDB"
        actions={
          <>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchKeys={["name", "registrationNumber"]}
        onRowClick={(row) => console.log("clicked", row)}
      />
    </div>
  );
}
