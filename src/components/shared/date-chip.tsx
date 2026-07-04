import { cn } from "@/lib/utils";

interface DateChipProps {
  day: string | number;
  month: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function DateChip({ day, month, variant = "primary", className }: DateChipProps) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg text-center",
        variant === "secondary" ? "bg-secondary-container text-secondary" : "bg-primary-fixed text-primary",
        className
      )}
    >
      <span className="text-base font-bold leading-none">{day}</span>
      <span className="text-[10px] font-bold uppercase leading-none mt-0.5">{month}</span>
    </div>
  );
}
