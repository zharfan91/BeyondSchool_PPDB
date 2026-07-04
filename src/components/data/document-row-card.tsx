"use client";

import { useRef } from "react";
import { FileText, Image, Trash2, RefreshCw, CloudUpload, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DocumentStatus = "uploaded" | "pending" | "rejected" | "valid" | "revisi" | "none" | "uploading";

interface DocumentRowCardProps {
  label: string;
  description?: string;
  accepts?: string;
  maxSizeMB?: number;
  status: DocumentStatus;
  filename?: string;
  rejectReason?: string;
  optional?: boolean;
  uploadProgress?: number;
  onUpload?: (file: File) => void;
  onDelete?: () => void;
  className?: string;
}

const statusConfig: Record<DocumentStatus, { label: string; badgeClass: string }> = {
  uploaded: { label: "Terunggah", badgeClass: "bg-success-bg text-success border border-success-border" },
  valid:    { label: "Valid",      badgeClass: "bg-success-bg text-success border border-success-border" },
  pending:  { label: "Pending",    badgeClass: "bg-warning-bg text-warning border border-warning-border" },
  revisi:   { label: "Perlu Revisi", badgeClass: "bg-warning-bg text-warning border border-warning-border" },
  rejected: { label: "Ditolak",   badgeClass: "bg-danger text-white" },
  none:     { label: "Belum Ada",  badgeClass: "bg-surface-container text-muted-foreground border border-border" },
  uploading: { label: "Mengunggah", badgeClass: "bg-info-bg text-info border border-info-border" },
};

export function DocumentRowCard({
  label,
  description,
  accepts = "PDF/JPG",
  maxSizeMB = 2,
  status,
  filename,
  rejectReason,
  optional = false,
  uploadProgress = 0,
  onUpload,
  onDelete,
  className,
}: DocumentRowCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cfg = statusConfig[status];
  const hasFile = status === "uploaded" || status === "valid" || status === "pending" || status === "revisi";
  const isRejected = status === "rejected" || status === "revisi";
  const isUploading = status === "uploading";

  const handleFile = (f: File) => {
    if (f.size > maxSizeMB * 1024 * 1024) return;
    onUpload?.(f);
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col gap-3 transition-colors",
        isRejected ? "border-danger bg-danger-bg/30" : "border-border bg-surface",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
              isRejected ? "bg-danger-bg text-danger" : "bg-surface-container text-muted-foreground"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : filename?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <Image className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {label}
              {optional && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(Opsional)</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description ?? `${accepts}, Maks ${maxSizeMB}MB`}
            </p>
          </div>
        </div>
        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap", cfg.badgeClass)}>
          {cfg.label}
        </span>
      </div>

      {/* Uploaded file row */}
      {hasFile && filename && (
        <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low border border-dashed border-border rounded-lg">
          <span className="text-xs text-muted-foreground truncate">{filename}</span>
          {onDelete && (
            <button
              onClick={onDelete}
              className="ml-2 text-danger hover:text-danger/80 transition-colors flex-shrink-0"
              aria-label="Hapus file"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-1">
          <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, uploadProgress))}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Mengunggah... {Math.round(uploadProgress)}%</p>
        </div>
      )}

      {/* Reject reason */}
      {isRejected && rejectReason && (
        <div className="flex items-start gap-2 px-3 py-2 bg-danger-bg border border-danger-border rounded-lg">
          <AlertCircle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-xs text-danger leading-snug">{rejectReason}</p>
        </div>
      )}

      {/* Upload / Re-upload button */}
      {(status === "none" || status === "pending") && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-primary text-primary rounded-lg hover:bg-primary/5 transition-all text-sm font-medium"
        >
          <CloudUpload className="h-4 w-4" />
          Klik untuk Unggah
        </button>
      )}
      {isRejected && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-danger text-danger rounded-lg hover:bg-danger-bg transition-all text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Unggah Ulang
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accepts.toLowerCase().split("/").map((a) => `.${a.trim()}`).join(",")}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        className="hidden"
      />
    </div>
  );
}
