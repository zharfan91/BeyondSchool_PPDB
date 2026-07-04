import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TimelineStep {
  title: string;
  description?: string;
  status: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="relative">
      {steps.map((step, i) => (
        <div key={i} className="relative flex gap-4 pb-8 last:pb-0">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                step.status === "completed"
                  ? "border-primary bg-primary text-white"
                  : step.status === "current"
                  ? "border-primary bg-white text-primary"
                  : "border-border bg-white text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{i + 1}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mt-1 w-0.5 flex-1",
                  step.status === "completed"
                    ? "bg-primary"
                    : "bg-border"
                )}
              />
            )}
          </div>
          <div className="pt-1">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "completed"
                  ? "text-foreground"
                  : step.status === "current"
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {step.title}
            </p>
            {step.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
