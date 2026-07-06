"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/data/stat-card";
import { DataTable, Column } from "@/components/data/data-table";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";

interface PaymentItem {
  id: string;
  name: string;
  invoice: string;
  program: string;
  amount: number;
  status: string;
  date: string;
}

interface FinanceStats {
  totalIncome: number;
  paidCount: number;
  pendingCount: number;
  targetPct: number;
}

export default function FinancePaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        fetch("/api/finance/payments"),
        fetch("/api/finance/stats"),
      ]);
      setPayments(await paymentsRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error("Failed to load finance payments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/finance/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal memverifikasi pembayaran");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<PaymentItem>[] = [
    { key: "name", header: "Nama", cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: "invoice", header: "No. Invoice", cell: (row) => <span className="font-mono text-sm text-muted-foreground">{row.invoice}</span> },
    { key: "program", header: "Program", cell: (row) => <span>{row.program}</span> },
    { key: "amount", header: "Jumlah", cell: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span> },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { key: "date", header: "Tanggal", cell: (row) => <span className="text-muted-foreground">{new Date(row.date).toLocaleDateString("id-ID")}</span> },
    {
      key: "action",
      header: "",
      cell: (row) =>
        row.status === "PAID" ? (
          <Button size="sm" variant="outline" disabled={busyId === row.id} onClick={() => handleVerify(row.id)}>
            {busyId === row.id ? "Memproses..." : "Verifikasi"}
          </Button>
        ) : null,
    },
  ];

  if (loading) {
    return <LoadingState rows={5} />;
  }

  return (
    <div>
      <PageHeader
        title="Pembayaran"
        description="Kelola dan pantau seluruh transaksi pembayaran PPDB"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Pemasukan" value={formatCurrency(stats?.totalIncome ?? 0)} icon={DollarSign} />
        <StatCard title="Lunas" value={stats?.paidCount ?? 0} icon={CreditCard} />
        <StatCard title="Menunggu" value={stats?.pendingCount ?? 0} icon={AlertTriangle} />
        <StatCard title="Target Tercapai" value={`${stats?.targetPct ?? 0}%`} icon={TrendingUp} />
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchable
        searchKeys={["name", "invoice"]}
      />
    </div>
  );
}
