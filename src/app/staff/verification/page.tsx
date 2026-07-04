"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface VerificationItem {
  registrationNumber: string;
  name: string;
  documents: string;
  status: string;
}

const columns: Column<VerificationItem>[] = [
  {
    key: "registrationNumber",
    header: "No. Registrasi",
    cell: (row) => <span className="font-mono text-sm">{row.registrationNumber}</span>,
  },
  {
    key: "name",
    header: "Nama",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: "documents",
    header: "Berkas",
    cell: (row) => <span>{row.documents}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "actions",
    header: "Aksi",
    cell: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success-bg">
          <CheckCircle className="mr-1 h-3 w-3" />
          Setuju
        </Button>
        <Button size="sm" variant="outline" className="text-danger border-danger/30 hover:bg-danger-bg">
          <XCircle className="mr-1 h-3 w-3" />
          Tolak
        </Button>
      </div>
    ),
  },
];

export default function VerificationPage() {
  const [data, setData] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/verification")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Verifikasi Pendaftaran"
        description="Periksa dan verifikasi kelengkapan berkas pendaftar"
      />
      <DataTable
        columns={columns}
        data={data}
        searchable
        searchKeys={["name", "registrationNumber"]}
      />
    </div>
  );
}
