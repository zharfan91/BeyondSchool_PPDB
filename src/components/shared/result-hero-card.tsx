import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultHeroCardAction {
  label: string;
  href: string;
  variant?: "primary" | "outline";
}

interface ResultHeroCardProps {
  status: "accepted" | "rejected" | "pending";
  name: string;
  message: string;
  actions?: ResultHeroCardAction[];
  className?: string;
}

const statusConfig = {
  accepted: {
    icon: CheckCircle2,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    badgeClass: "bg-success text-white",
    badgeLabel: "Dinyatakan Lulus",
    heading: (name: string) => `Selamat, ${name}!`,
  },
  rejected: {
    icon: XCircle,
    iconBg: "bg-danger/10",
    iconColor: "text-danger",
    badgeClass: "bg-danger text-white",
    badgeLabel: "Belum Berhasil",
    heading: (name: string) => `Terima Kasih, ${name}`,
  },
  pending: {
    icon: Clock,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    badgeClass: "bg-warning text-white",
    badgeLabel: "Sedang Diproses",
    heading: (name: string) => `Mohon Tunggu, ${name}`,
  },
};

function ResultHeroCard({ status, name, message, actions, className }: ResultHeroCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white border border-border p-8 shadow-sm flex flex-col justify-between",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.iconBg, config.iconColor)}>
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1", config.badgeClass)}>
              {config.badgeLabel}
            </span>
            <h3 className="text-2xl font-bold text-foreground">{config.heading(name)}</h3>
          </div>
        </div>
        <p className="text-muted-foreground max-w-lg mt-4 leading-relaxed">{message}</p>
      </div>

      {actions && actions.length > 0 && (
        <div className="relative z-10 flex flex-wrap gap-3 mt-8">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                action.variant === "outline"
                  ? "px-6 py-3 border border-border text-foreground rounded-xl font-bold hover:bg-surface-container-low transition-all"
                  : "px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all"
              )}
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export { ResultHeroCard };
