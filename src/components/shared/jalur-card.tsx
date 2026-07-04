import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type JalurAccent = "primary" | "success" | "warning" | "info";

interface JalurCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  quota: string;
  href: string;
  featured?: boolean;
  accent?: JalurAccent;
  className?: string;
}

const accentClasses: Record<JalurAccent, { iconTile: string; ribbon: string; border: string }> = {
  primary: { iconTile: "bg-primary/10 text-primary", ribbon: "bg-primary text-white", border: "border-primary" },
  success: { iconTile: "bg-success/10 text-success", ribbon: "bg-success text-white", border: "border-success" },
  warning: { iconTile: "bg-warning/10 text-warning", ribbon: "bg-warning text-white", border: "border-warning" },
  info: { iconTile: "bg-info/10 text-info", ribbon: "bg-info text-white", border: "border-info" },
};

function JalurCard({
  icon: Icon,
  title,
  description,
  benefits,
  quota,
  href,
  featured,
  accent = "primary",
  className,
}: JalurCardProps) {
  const accentCls = accentClasses[accent];
  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-white rounded-xl p-6 border shadow-sm",
        featured ? cn(accentCls.border, "shadow-md") : "border-border",
        className
      )}
    >
      {featured && (
        <div className={cn("absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", accentCls.ribbon)}>
          Populer
        </div>
      )}
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", accentCls.iconTile)}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 flex-grow">{description}</p>
      <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
        {benefits.map((benefit) => (
          <li className="flex items-start gap-2" key={benefit}>
            <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
            {benefit}
          </li>
        ))}
      </ul>
      <div className="pt-4 border-t border-border flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Kuota: <strong className="text-foreground">{quota}</strong>
        </span>
        <Link
          href={href}
          className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
        >
          Detail <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export { JalurCard };
