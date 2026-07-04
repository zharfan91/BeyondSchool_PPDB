import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Upload, Info } from "lucide-react";

type ActivityType = "success" | "warning" | "danger" | "info" | "upload";

interface ActivityEvent {
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
}

interface ActivityLogProps {
  events: ActivityEvent[];
  className?: string;
}

const typeConfig: Record<ActivityType, { icon: React.ComponentType<{ className?: string }>; dotClass: string }> = {
  success: { icon: CheckCircle,    dotClass: "bg-success" },
  warning: { icon: AlertTriangle,  dotClass: "bg-warning" },
  danger:  { icon: XCircle,        dotClass: "bg-danger" },
  info:    { icon: Info,           dotClass: "bg-info" },
  upload:  { icon: Upload,         dotClass: "bg-primary-container" },
};

export function ActivityLog({ events, className }: ActivityLogProps) {
  return (
    <div className={cn("relative space-y-4", className)}>
      {/* Vertical connector line */}
      {events.length > 1 && (
        <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-border" />
      )}

      {events.map((event, i) => {
        const { icon: Icon, dotClass } = typeConfig[event.type];
        return (
          <div key={i} className="relative flex gap-4 pl-1">
            {/* Dot */}
            <div
              className={cn(
                "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-4 border-surface",
                dotClass
              )}
            >
              <Icon className="h-3 w-3 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 rounded-lg border border-border bg-surface-container-low p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground leading-tight">{event.title}</p>
                <span className="flex-shrink-0 text-xs text-muted-foreground">{event.timestamp}</span>
              </div>
              {event.description && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{event.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
