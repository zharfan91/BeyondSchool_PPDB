"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  variant = "default",
  loading,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-high-elevation animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full mb-4 ${
              variant === "destructive" ? "bg-danger-bg" : "bg-primary/10"
            }`}
          >
            <AlertTriangle
              className={`h-6 w-6 ${
                variant === "destructive" ? "text-danger" : "text-primary"
              }`}
            />
          </div>
          <h3 className="text-headline-md text-foreground mb-2">{title}</h3>
          <p className="text-body-md text-muted-foreground mb-6">{description}</p>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              className="flex-1"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Memproses..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
