import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerificationLegendProps {
  items?: {
    icon: React.ComponentType<{ className?: string }>;
    color: "success" | "warning" | "danger";
    title: string;
    description: string;
  }[];
  className?: string;
}

const defaultItems: NonNullable<VerificationLegendProps["items"]> = [
  {
    icon: CheckCircle2,
    color: "success",
    title: "Valid",
    description: "Dokumen telah disetujui oleh tim verifikator.",
  },
  {
    icon: AlertTriangle,
    color: "warning",
    title: "Revisi",
    description: "Dokumen perlu diperbaiki dan diunggah ulang.",
  },
  {
    icon: XCircle,
    color: "danger",
    title: "Ditolak",
    description: "Dokumen tidak memenuhi syarat dan harus diganti.",
  },
];

function VerificationLegend({ items = defaultItems, className }: VerificationLegendProps) {
  return (
    <div className={cn("bg-surface-bright border border-border rounded-xl p-5", className)}>
      <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
        Panduan Verifikasi
      </h4>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div
              className={cn(
                "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                item.color === "success"
                  ? "bg-success/10 text-success"
                  : item.color === "warning"
                  ? "bg-warning/10 text-warning"
                  : "bg-danger/10 text-danger"
              )}
            >
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { VerificationLegend };
