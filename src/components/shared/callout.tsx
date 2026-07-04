import { Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalloutProps {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  info: {
    bgBorder: "bg-info-bg border-info-border",
    icon: "text-info",
    Icon: Info,
  },
  success: {
    bgBorder: "bg-success-bg border-success-border",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  warning: {
    bgBorder: "bg-warning-bg border-warning-border",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
  danger: {
    bgBorder: "bg-danger-bg border-danger-border",
    icon: "text-danger",
    Icon: AlertCircle,
  },
};

function Callout({ variant = "info", title, description, children, className }: CalloutProps) {
  const { bgBorder, icon, Icon } = variantStyles[variant];

  return (
    <div className={cn("flex gap-3 rounded-lg border p-4", bgBorder, className)}>
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", icon)} />
      <div>
        {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
        <p className="text-sm text-muted-foreground">{children ?? description}</p>
      </div>
    </div>
  );
}

export { Callout };
