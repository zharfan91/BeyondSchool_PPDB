import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface JenjangCardStat {
  label: string;
  value: string | number;
}

interface JenjangCardProps {
  icon: LucideIcon;
  title: string;
  stats: JenjangCardStat[];
  href: string;
  ctaLabel?: string;
  className?: string;
}

export function JenjangCard({
  icon: Icon,
  title,
  stats,
  href,
  ctaLabel = "Lihat Detail",
  className,
}: JenjangCardProps) {
  return (
    <div
      className={cn(
        "group bg-white border border-border rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-1",
        className
      )}
    >
      <div className="bg-surface-container-low p-4 rounded-lg mb-4 flex justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="h-10 w-10" />
      </div>
      <h4 className="font-bold text-foreground mb-2">{title}</h4>
      <div className="space-y-1 mb-4 text-sm text-muted-foreground">
        {stats.map((stat) => (
          <div className="flex justify-between" key={stat.label}>
            <span>{stat.label}</span>
            <span className="font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </div>
      <Link
        href={href}
        className="block w-full text-center py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-all"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
