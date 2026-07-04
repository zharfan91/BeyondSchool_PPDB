"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface ApprovalItem {
  registrationNumber: string;
  name: string;
  program: string;
  score: number;
  status: string;
}

const initialData: ApprovalItem[] = [
  { registrationNumber: "PPDB/2026/00001", name: "Ahmad Fauzi", program: "IPA", score: 85, status: "PENDING_APPROVAL" },
  { registrationNumber: "PPDB/2026/00002", name: "Siti Nurhaliza", program: "IPS", score: 92, status: "PENDING_APPROVAL" },
  { registrationNumber: "PPDB/2026/00004", name: "Dewi Lestari", program: "BAHASA", score: 78, status: "PENDING_APPROVAL" },
];

const columns: Column<ApprovalItem>[] = [
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
    key: "program",
    header: "Program",
    cell: (row) => <span>{row.program}</span>,
  },
  {
    key: "score",
    header: "Nilai",
    cell: (row) => <span className="font-semibold">{row.score}</span>,
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
        <Button size="sm" variant="outline">
          <Eye className="mr-1 h-3 w-3" />
          Detail
        </Button>
        <Button size="sm" variant="outline" className="text-success border-success/30 hover:bg-success-bg">
          <CheckCircle className="mr-1 h-3 w-3" />
          Setujui
        </Button>
        <Button size="sm" variant="outline" className="text-danger border-danger/30 hover:bg-danger-bg">
          <XCircle className="mr-1 h-3 w-3" />
          Tolak
        </Button>
      </div>
    ),
  },
];

export default function PrincipalApprovalsPage() {
  const [data] = useState(initialData);

  return (
    <div>
      <PageHeader
        title="Persetujuan Kepala Sekolah"
        description="Review dan setujui hasil seleksi akhir"
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
