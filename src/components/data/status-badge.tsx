import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  // Registration statuses
  DRAFT: "bg-surface-container text-muted-foreground",
  SUBMITTED: "bg-info-bg text-info border border-info-border",
  VERIFIED: "bg-success-bg text-success border border-success-border",
  INCOMPLETE: "bg-warning-bg text-warning border border-warning-border",
  COMPLETED: "bg-success-bg text-success border border-success-border",
  // Selection statuses
  PENDING: "bg-warning-bg text-warning border border-warning-border",
  PASSED: "bg-success-bg text-success border border-success-border",
  WAITLIST: "bg-warning-bg text-warning border border-warning-border",
  REJECTED: "bg-danger-bg text-danger border border-danger-border",
  // Payment statuses
  PAID: "bg-success-bg text-success border border-success-border",
  WAITING_PAYMENT: "bg-warning-bg text-warning border border-warning-border",
  EXPIRED: "bg-surface-container text-muted-foreground",
  FAILED: "bg-danger-bg text-danger border border-danger-border",
  REFUNDED: "bg-info-bg text-info border border-info-border",
  // Document statuses (from upload page designs)
  UPLOADED: "bg-success-bg text-success border border-success-border",
  VALID: "bg-success-bg text-success border border-success-border",
  REVISI: "bg-warning-bg text-warning border border-warning-border",
  NO_FILE: "bg-surface-container text-muted-foreground border border-border",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draf",
  SUBMITTED: "Terkirim",
  VERIFIED: "Terverifikasi",
  INCOMPLETE: "Belum Lengkap",
  COMPLETED: "Selesai",
  PENDING: "Menunggu",
  PASSED: "Lulus",
  WAITLIST: "Cadangan",
  REJECTED: "Ditolak",
  PAID: "Lunas",
  WAITING_PAYMENT: "Menunggu Bayar",
  EXPIRED: "Kadaluarsa",
  FAILED: "Gagal",
  REFUNDED: "Dikembalikan",
  UPLOADED: "Terunggah",
  VALID: "Valid",
  REVISI: "Perlu Revisi",
  NO_FILE: "Belum Ada",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-surface-container text-muted-foreground",
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
