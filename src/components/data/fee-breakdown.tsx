import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface FeeBreakdownProps {
  items: { label: string; description?: string; amount: number }[];
  total?: number;
  className?: string;
}

function FeeBreakdown({ items, total, className }: FeeBreakdownProps) {
  const computedTotal = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between items-center py-2 border-b border-dashed border-border"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
          <p className="text-sm font-bold text-foreground">{formatCurrency(item.amount)}</p>
        </div>
      ))}
      <div className="flex justify-between items-center pt-2">
        <p className="text-base font-bold text-foreground">Total</p>
        <p className="text-xl font-bold text-primary">{formatCurrency(total ?? computedTotal)}</p>
      </div>
    </div>
  );
}

export { FeeBreakdown };
