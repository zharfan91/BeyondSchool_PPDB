"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

interface DangerZoneCardProps {
  title?: string;
  description: string;
  actionLabel: string;
  confirmTitle: string;
  confirmDescription: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
}

export function DangerZoneCard({
  title = "Danger Zone",
  description,
  actionLabel,
  confirmTitle,
  confirmDescription,
  onConfirm,
  className,
}: DangerZoneCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className={cn("bg-danger-bg border border-danger-border rounded-xl p-5", className)}>
      <h4 className="font-bold text-danger mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        {actionLabel}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={confirmTitle}
        description={confirmDescription}
        variant="destructive"
        loading={loading}
        confirmLabel={actionLabel}
      />
    </div>
  );
}
