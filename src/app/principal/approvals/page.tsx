"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface ApprovalItem {
  id: string;
  registrationNumber: string;
  name: string;
  program: string;
  currentStatus: string;
}

function getColumns(
  onAction: (row: ApprovalItem, decision: "PASSED" | "REJECTED") => void,
  actioningId: string | null
): Column<ApprovalItem>[] {
  return [
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
      key: "currentStatus",
      header: "Status",
      cell: (row) => <StatusBadge status={row.currentStatus} />,
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row) => {
        const isBusy = actioningId === row.id;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Eye className="mr-1 h-3 w-3" />
              Detail
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-success border-success/30 hover:bg-success-bg"
              disabled={isBusy}
              onClick={() => onAction(row, "PASSED")}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Setujui
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-danger border-danger/30 hover:bg-danger-bg"
              disabled={isBusy}
              onClick={() => onAction(row, "REJECTED")}
            >
              <XCircle className="mr-1 h-3 w-3" />
              Tolak
            </Button>
          </div>
        );
      },
    },
  ];
}

export default function PrincipalApprovalsPage() {
  const [data, setData] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = () => {
    return fetch("/api/selection")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data seleksi");
        return res.json();
      })
      .then((rows) => {
        setData(rows);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch selection data:", err);
        setError("Gagal memuat data seleksi");
      });
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const handleAction = async (
    row: ApprovalItem,
    decision: "PASSED" | "REJECTED"
  ) => {
    const confirmMessage =
      decision === "PASSED"
        ? `Setujui pendaftaran ${row.name}?`
        : `Tolak pendaftaran ${row.name}?`;

    if (!window.confirm(confirmMessage)) return;

    setActioningId(row.id);

    try {
      const res = await fetch(`/api/selection/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal memproses keputusan seleksi");
        return;
      }

      await loadData();
    } catch (err) {
      console.error("Failed to process selection decision:", err);
      alert("Gagal memproses keputusan seleksi");
    } finally {
      setActioningId(null);
    }
  };

  const columns = getColumns(handleAction, actioningId);

  return (
    <div>
      <PageHeader
        title="Persetujuan Kepala Sekolah"
        description="Review dan setujui hasil seleksi akhir"
      />

      {error && (
        <p className="mb-4 text-sm text-danger">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat data...</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          searchable
          searchKeys={["name", "registrationNumber"]}
        />
      )}
    </div>
  );
}
