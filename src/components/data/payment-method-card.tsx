"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodCardProps {
  name: string;
  description: string;
  logo?: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

function PaymentMethodCard({
  name,
  description,
  logo,
  selected,
  onSelect,
  disabled,
  className,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full bg-white rounded-xl p-3 flex items-center gap-3 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        selected
          ? "border-2 border-primary shadow-sm"
          : "border border-border hover:bg-surface-container-low",
        className
      )}
    >
      <div className="w-11 h-11 bg-surface-container rounded flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
        {logo ?? name.slice(0, 3).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
    </button>
  );
}

export { PaymentMethodCard };
