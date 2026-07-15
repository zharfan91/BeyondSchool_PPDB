"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, Column } from "@/components/data/data-table";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/data/empty-state";
import { History } from "lucide-react";

interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  USER_CREATED: "Pengguna Dibuat",
  USER_ROLE_CHANGED: "Role Diubah",
  PERIOD_CREATED: "Periode Dibuat",
  PERIOD_ACTIVATED: "Periode Diaktifkan",
  PERIOD_DEACTIVATED: "Periode Dinonaktifkan",
  USER_BANNED: "Akun Dinonaktifkan",
  USER_UNBANNED: "Akun Diaktifkan",
  USER_SELF_DEACTIVATED: "Menonaktifkan Akun Sendiri",
  SESSION_REVOKED: "Sesi Dipaksa Logout",
  SESSION_REVOKED_ALL: "Semua Sesi Dipaksa Logout",
  SETTINGS_UPDATED: "Pengaturan Diperbarui",
};

function formatMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata) return "-";
  return Object.entries(metadata)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-log")
      .then((res) => res.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load audit log:", err))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "createdAt",
      header: "Waktu",
      cell: (row) => <span className="text-muted-foreground text-sm">{new Date(row.createdAt).toLocaleString("id-ID")}</span>,
    },
    { key: "actorName", header: "Aktor", cell: (row) => <span className="font-medium">{row.actorName}</span> },
    { key: "action", header: "Aksi", cell: (row) => <span>{ACTION_LABELS[row.action] ?? row.action}</span> },
    { key: "targetType", header: "Target", cell: (row) => <span className="text-muted-foreground">{row.targetType}</span> },
    { key: "metadata", header: "Detail", cell: (row) => <span className="text-sm text-muted-foreground">{formatMetadata(row.metadata)}</span> },
  ];

  if (loading) {
    return <LoadingState rows={5} />;
  }

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Riwayat aksi sensitif di seluruh sistem — khusus Super Admin"
      />
      {logs.length === 0 ? (
        <EmptyState icon={History} title="Belum Ada Riwayat" description="Aksi sensitif seperti pembuatan pengguna atau perubahan pengaturan akan tercatat di sini." />
      ) : (
        <DataTable columns={columns} data={logs} searchable searchKeys={["actorName", "action", "targetType"]} />
      )}
    </div>
  );
}
