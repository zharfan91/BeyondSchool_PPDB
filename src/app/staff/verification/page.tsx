"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { CheckCircle, XCircle } from "lucide-react";

interface VerificationItem {
  id: string;
  registrationNumber: string;
  name: string;
  documents: string;
  status: string;
}

function getColumns(
  onAction: (row: VerificationItem, action: "approve" | "reject") => void,
  actioningId: string | null
): Column<VerificationItem>[] {
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
      cell: (row) => {
        const isBusy = actioningId === row.id;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-success border-success/30 hover:bg-success-bg"
              disabled={isBusy}
              onClick={() => onAction(row, "approve")}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Setuju
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-danger border-danger/30 hover:bg-danger-bg"
              disabled={isBusy}
              onClick={() => onAction(row, "reject")}
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

export default function VerificationPage() {
  const [data, setData] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = () => {
    return fetch("/api/verification")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const handleAction = async (
    row: VerificationItem,
    action: "approve" | "reject"
  ) => {
    let note: string | undefined;

    if (action === "reject") {
      const input = window.prompt("Catatan penolakan (opsional):");
      if (input === null) return;
      note = input.trim() ? input.trim() : undefined;
    }

    setActioningId(row.id);

    try {
      const res = await fetch(`/api/verification/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal memproses verifikasi");
        return;
      }

      await loadData();
    } catch (error) {
      console.error("Failed to process verification:", error);
      alert("Gagal memproses verifikasi");
    } finally {
      setActioningId(null);
    }
  };

  const columns = getColumns(handleAction, actioningId);

  return (
    <div>
      <PageHeader
        title="Verifikasi Pendaftaran"
        description="Periksa dan verifikasi kelengkapan berkas pendaftar"
      />
      {loading ? (
        <LoadingState rows={5} />
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
