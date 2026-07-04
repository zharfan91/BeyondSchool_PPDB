import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ContactChannelCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  value: string;
  variant?: "primary" | "success" | "info";
  className?: string;
}

const variantClasses: Record<NonNullable<ContactChannelCardProps["variant"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
};

function ContactChannelCard({
  icon: Icon,
  title,
  subtitle,
  value,
  variant = "primary",
  className,
}: ContactChannelCardProps) {
  return (
    <div
      className={cn(
        "group p-5 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-center flex flex-col items-center",
        className
      )}
    >
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
          variantClasses[variant]
        )}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h4 className="font-bold text-lg text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
      <p className="text-primary font-bold">{value}</p>
    </div>
  );
}

export { ContactChannelCard };
