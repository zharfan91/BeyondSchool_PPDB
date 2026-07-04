import { CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentChecklistItem {
  label: string;
  status?: "complete" | "attention";
}

interface DocumentChecklistProps {
  title: string;
  items: DocumentChecklistItem[];
  className?: string;
}

export function DocumentChecklist({ title, items, className }: DocumentChecklistProps) {
  return (
    <div className={cn("bg-surface rounded-xl border border-border overflow-hidden", className)}>
      <div className="p-4 border-b border-border bg-surface-container-low flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</span>
      </div>
      <div className="divide-y divide-border">
        {items.map((item, i) => (
          <div key={item.label} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded bg-surface-container-high flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <p className="font-semibold text-sm text-foreground">{item.label}</p>
            </div>
            {item.status === "attention" ? (
              <Info className="h-5 w-5 text-warning shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
