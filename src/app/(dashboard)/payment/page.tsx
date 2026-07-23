"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FeeBreakdown } from "@/components/data/fee-breakdown";
import { StatusBadge } from "@/components/data/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/data/empty-state";
import { formatCurrency } from "@/lib/utils";
import { downloadTablePdf } from "@/lib/pdf";
import { Download, Wallet, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

const SNAP_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ?? "https://app.sandbox.midtrans.com/snap/snap.js";
const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

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

// Minimal typing for the Snap global injected by snap.js.
interface SnapCallbacks {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}
declare global {
  interface Window {
    snap?: { pay: (token: string, cb: SnapCallbacks) => void };
  }
}

function loadSnapScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.snap) return resolve(true);
    if (!CLIENT_KEY) return resolve(false);
    const existing = document.querySelector<HTMLScriptElement>("script[data-snap]");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", CLIENT_KEY);
    script.setAttribute("data-snap", "true");
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Set when the API returns a simulated payment (no real gateway configured).
  const [sim, setSim] = useState<{ paymentId: string; amount: number; name: string } | null>(null);
  const [simBusy, setSimBusy] = useState(false);
  const [simMode, setSimMode] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setRegistrationId(data.registrationId ?? null);
      setPaymentTypes(data.paymentTypes ?? []);
      setPayments(data.payments ?? []);
      setSimMode(!!data.simulation);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadSnapScript();
  }, [load]);

  const handlePay = async (paymentTypeId: string, paymentName: string) => {
    setBusyId(paymentTypeId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentTypeId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body?.error ?? "Gagal memulai pembayaran");
        return;
      }

      // Simulation mode: no real gateway — show a success/fail chooser.
      if (body.simulation) {
        setSim({ paymentId: body.paymentId, amount: body.amount, name: paymentName });
        return;
      }

      const ready = await loadSnapScript();
      if (!ready || !window.snap) {
        // Snap.js unavailable (no client key / blocked) — fall back to redirect.
        if (body.redirectUrl) window.location.href = body.redirectUrl;
        else alert("Tidak dapat memuat halaman pembayaran. Coba lagi nanti.");
        return;
      }

      window.snap.pay(body.snapToken, {
        onSuccess: () => load(),
        onPending: () => load(),
        onError: () => load(),
        onClose: () => load(),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSimulate = async (outcome: "success" | "fail") => {
    if (!sim) return;
    setSimBusy(true);
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: sim.paymentId, outcome }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(body?.error ?? "Gagal memproses simulasi");
        return;
      }
      setSim(null);
      await load();
    } finally {
      setSimBusy(false);
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
      subtitle: "Pembayaran diproses melalui payment gateway",
      head: ["Jenis Pembayaran", "No. Invoice", "Jumlah", "Status"],
      rows: paymentTypes.map((pt) => {
        const payment = payments.find((p) => p.paymentTypeId === pt.id);
        return [
          pt.name,
          payment?.invoiceNumber ?? "-",
          formatCurrency(Number(pt.amount)),
          payment?.status ?? "Belum Dibayar",
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
      <PageHeader title="Pembayaran" description="Bayar biaya pendaftaran secara online melalui payment gateway" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-headline-md">Rincian Biaya</CardTitle>
          </CardHeader>
          <CardContent>
            <FeeBreakdown items={feeItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-headline-md">Cara Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {simMode && (
              <div className="rounded-lg bg-warning-bg border border-warning-border p-2 text-xs text-warning">
                <strong>Mode Simulasi.</strong> Payment gateway sungguhan belum aktif — pembayaran akan disimulasikan.
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Klik <strong>Bayar</strong> pada tagihan di bawah. Anda akan diarahkan ke halaman pembayaran aman
              (Virtual Account, QRIS, atau e-wallet). Status otomatis diperbarui setelah pembayaran berhasil —
              tidak perlu konfirmasi manual.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-headline-md">Status Tagihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentTypes.map((pt) => {
              const payment = payments.find((p) => p.paymentTypeId === pt.id);
              const status = payment?.status;
              const isPaid = status === "PAID" || status === "VERIFIED";
              const isPending = status === "WAITING_PAYMENT";

              return (
                <div key={pt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{pt.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(Number(payment?.amount ?? pt.amount))}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {status && <StatusBadge status={status} />}
                    {isPaid ? (
                      <span className="flex items-center gap-1 text-sm text-success">
                        <CheckCircle2 className="h-4 w-4" /> Lunas
                      </span>
                    ) : isPending ? (
                      <span className="flex items-center gap-1 text-sm text-warning">
                        <Clock className="h-4 w-4" /> Menunggu pembayaran
                      </span>
                    ) : null}
                    {!isPaid && (
                      <Button disabled={busyId === pt.id} onClick={() => handlePay(pt.id, pt.name)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {busyId === pt.id ? "Memproses..." : isPending ? "Lanjutkan Bayar" : "Bayar"}
                      </Button>
                    )}
                  </div>
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

      {/* Simulated payment gateway (active when no real Midtrans key is set). */}
      {sim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !simBusy && setSim(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 inline-flex rounded-full bg-warning-bg px-2 py-0.5 text-xs font-medium text-warning">Mode Simulasi</div>
            <h3 className="text-headline-md mb-1">Simulasi Pembayaran</h3>
            <p className="text-sm text-muted-foreground mb-1">{sim.name}</p>
            <p className="text-2xl font-bold text-foreground mb-4">{formatCurrency(sim.amount)}</p>
            <p className="text-xs text-muted-foreground mb-4">
              Payment gateway sungguhan belum aktif. Pilih hasil pembayaran untuk mensimulasikan respons gateway.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" disabled={simBusy} onClick={() => handleSimulate("success")}>
                {simBusy ? "Memproses..." : "Bayar (Berhasil)"}
              </Button>
              <Button variant="outline" className="flex-1" disabled={simBusy} onClick={() => handleSimulate("fail")}>
                Gagal
              </Button>
            </div>
            <button className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground" disabled={simBusy} onClick={() => setSim(null)}>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
