import { cn } from "@/lib/utils";
import Link from "next/link";

interface AnnouncementItem {
  day: string;
  month: string;
  title: string;
  description?: string;
  variant?: "primary" | "secondary";
}

interface AnnouncementPanelProps {
  items: AnnouncementItem[];
  maxItems?: number;
  viewAllHref?: string;
  className?: string;
}

export function AnnouncementPanel({
  items,
  maxItems = 5,
  viewAllHref,
  className,
}: AnnouncementPanelProps) {
  const visible = items.slice(0, maxItems);

  return (
    <div className={cn("rounded-xl border border-border bg-surface shadow-sm overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border bg-surface-container-low px-4 py-3">
        <h4 className="text-sm font-bold text-foreground">Pengumuman Terbaru</h4>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs font-semibold text-primary hover:underline">
            Lihat Semua
          </Link>
        )}
      </div>

      <div className="divide-y divide-border">
        {visible.map((item, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors">
            <div
              className={cn(
                "flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg text-center",
                item.variant === "secondary"
                  ? "bg-secondary-container text-secondary"
                  : "bg-primary-fixed text-primary"
              )}
            >
              <span className="text-base font-bold leading-none">{item.day}</span>
              <span className="text-[10px] font-bold uppercase leading-none mt-0.5">{item.month}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada pengumuman.
          </div>
        )}
      </div>
    </div>
  );
}
