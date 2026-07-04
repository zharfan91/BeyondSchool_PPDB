import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeroBannerAction {
  label: string;
  href: string;
}

interface HeroBannerProps {
  name: string;
  subtitle?: string;
  primaryAction: HeroBannerAction;
  secondaryAction?: HeroBannerAction;
  statusLabel?: string;
  className?: string;
}

export function HeroBanner({
  name,
  subtitle,
  primaryAction,
  secondaryAction,
  statusLabel = "Status Akun: Aktif",
  className,
}: HeroBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-8 text-white shadow-lg",
        "bg-primary-container flex flex-col md:flex-row justify-between items-center gap-8",
        className
      )}
      style={{ background: "linear-gradient(135deg, #004ac6 0%, #2563eb 100%)" }}
    >
      {/* Content */}
      <div className="relative z-10 space-y-2">
        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
          {statusLabel}
        </span>
        <h2 className="text-2xl font-bold leading-tight">Selamat Datang, {name}!</h2>
        {subtitle && (
          <p className="text-base opacity-90 max-w-xl leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="relative z-10 flex gap-3 flex-shrink-0">
        <Link
          href={primaryAction.href}
          className="px-5 py-2.5 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-all shadow-md text-sm"
        >
          {primaryAction.label}
        </Link>
        {secondaryAction && (
          <Link
            href={secondaryAction.href}
            className="px-5 py-2.5 border border-white/30 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all text-sm"
          >
            {secondaryAction.label}
          </Link>
        )}
      </div>

      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
    </div>
  );
}
