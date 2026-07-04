import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionMotifProps {
  icon: LucideIcon;
  className?: string;
}

export function SectionMotif({ icon: Icon, className }: SectionMotifProps) {
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1}
      className={cn("pointer-events-none absolute -z-10 text-primary opacity-[0.06]", className)}
    />
  );
}
