import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KpiCard({ label, value, subValue, trend, className }: KpiCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <p className="text-label-md text-muted-foreground mb-1">{label}</p>
        <p className="text-headline-lg text-foreground">{value}</p>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success" : "text-danger"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {subValue && (
            <span className="text-xs text-muted-foreground">{subValue}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
