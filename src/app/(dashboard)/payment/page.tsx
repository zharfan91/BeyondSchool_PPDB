"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeeBreakdown } from "@/components/data/fee-breakdown";
import { CopyableCode } from "@/components/data/copyable-code";
import { StatusBadge } from "@/components/data/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/data/empty-state";
import { formatCurrency } from "@/lib/utils";
import { downloadTablePdf } from "@/lib/pdf";
import { Download, Wallet, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const SCHOOL_BANK_ACCOUNT = "Bank Mandiri a.n. Yayasan Beyond School — 123-00-4567890-1";

interface PaymentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  amount: string;
  isMandatory: boolean;
}

interface Payment {
  id: string;
  paymentTypeId: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  paidAt: string | null;
}

export default function PaymentPage() {
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setRegistrationId(data.registrationId ?? null);
      setPaymentTypes(data.paymentTypes ?? []);
      setPayments(data.payments ?? []);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (paymentTypeId: string) => {
    setBusyId(paymentTypeId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentTypeId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal membuat tagihan");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirm = async (paymentId: string) => {
    setBusyId(paymentId);
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "Gagal mengonfirmasi pembayaran");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <LoadingState rows={3} />;
  }

  if (!registrationId) {
    return (
      <div>
        <PageHeader title="Pembayaran" description="Informasi biaya dan status pembayaran" />
        <EmptyState
          icon={Wallet}
          title="Belum Ada Pendaftaran"
          description="Selesaikan formulir pendaftaran terlebih dahulu untuk melihat tagihan pembayaran."
          action={{ label: "Mulai Pendaftaran", onClick: () => router.push("/registration") }}
        />
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    downloadTablePdf({
      title: "Invoice Pembayaran PPDB",
      subtitle: SCHOOL_BANK_ACCOUNT,
      head: ["Jenis Pembayaran", "No. Invoice", "Jumlah", "Status"],
      rows: paymentTypes.map((pt) => {
        const payment = payments.find((p) => p.paymentTypeId === pt.id);
        return [
          pt.name,
          payment?.invoiceNumber ?? "-",
          formatCurrency(Number(pt.amount)),
          payment?.status ?? "Belum Dibuat",
        ];
      }),
      fileName: "invoice-pembayaran.pdf",
    });
  };

  const feeItems = paymentTypes.map((pt) => ({
    label: pt.name,
    description: pt.description ?? undefined,
    amount: Number(pt.amount),
  }));

  return (
    <div>
      <PageHeader title="Pembayaran" description="Informasi biaya dan status pembayaran" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-headline-md">Rincian Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <FeeBreakdown items={feeItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Rekening Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Lakukan transfer ke rekening berikut, lalu sertakan kode referensi pada setiap tagihan di bawah.
            </p>
            <p className="text-sm font-semibold text-foreground">{SCHOOL_BANK_ACCOUNT}</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-headline-md">Status Tagihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentTypes.map((pt) => {
              const payment = payments.find((p) => p.paymentTypeId === pt.id);

              if (!payment) {
                return (
                  <div
                    key={pt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{pt.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(Number(pt.amount))}</p>
                    </div>
                    <Button
                      variant="outline"
                      disabled={busyId === pt.id}
                      onClick={() => handleCreate(pt.id)}
                    >
                      {busyId === pt.id ? "Memproses..." : "Buat Tagihan"}
                    </Button>
                  </div>
                );
              }

              const isPaid = payment.status === "PAID" || payment.status === "VERIFIED";

              return (
                <div key={pt.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{pt.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(Number(payment.amount))}</p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>

                  {isPaid ? (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      {payment.status === "VERIFIED" ? "Pembayaran terverifikasi" : "Menunggu verifikasi oleh bagian keuangan"}
                    </div>
                  ) : (
                    <>
                      <CopyableCode label="Kode Referensi Transfer" value={payment.invoiceNumber} />
                      <Button
                        disabled={busyId === payment.id}
                        onClick={() => handleConfirm(payment.id)}
                      >
                        {busyId === payment.id ? "Memproses..." : "Saya Sudah Transfer"}
                      </Button>
                    </>
                  )}
                </div>
              );
            })}

            <div className="pt-2">
              <Button variant="outline" onClick={handleDownloadInvoice}>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
