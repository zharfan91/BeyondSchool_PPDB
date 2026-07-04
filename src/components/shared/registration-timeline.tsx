import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface TimelineStep {
  icon: LucideIcon;
  title: string;
  date: string;
  active?: boolean;
}

interface RegistrationTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function RegistrationTimeline({ steps, className }: RegistrationTimelineProps) {
  return (
    <div className={cn("relative flex flex-col lg:flex-row justify-between gap-8", className)}>
      <div className="absolute top-8 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-border lg:block" />
      {steps.map((step) => (
        <div key={step.title} className="group relative z-10 flex flex-col items-center lg:w-1/5">
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all",
              step.active
                ? "bg-primary text-white shadow-lg"
                : "border border-border bg-surface-container-high text-muted-foreground group-hover:bg-primary-container group-hover:text-white"
            )}
          >
            <step.icon className="h-8 w-8" />
          </div>
          <h4 className={cn("mb-1 font-semibold", step.active ? "text-foreground" : "text-muted-foreground")}>
            {step.title}
          </h4>
          <p className="text-xs text-muted-foreground">{step.date}</p>
        </div>
      ))}
    </div>
  );
}
