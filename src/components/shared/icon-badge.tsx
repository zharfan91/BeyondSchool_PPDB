import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const iconBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary/10 text-primary",
        success: "bg-success/10 text-success",
        warning: "bg-warning/10 text-warning",
        danger: "bg-danger/10 text-danger",
        info: "bg-info/10 text-info",
        neutral: "bg-surface-container-highest text-muted-foreground",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface IconBadgeProps extends VariantProps<typeof iconBadgeVariants> {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

function IconBadge({ icon: Icon, variant, size, className, iconClassName }: IconBadgeProps) {
  return (
    <div className={cn(iconBadgeVariants({ variant, size }), className)}>
      <Icon
        className={cn(
          size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5",
          iconClassName
        )}
      />
    </div>
  );
}

export { IconBadge, iconBadgeVariants };
