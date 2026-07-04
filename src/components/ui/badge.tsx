import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        success: "bg-success-bg text-success border border-success-border",
        warning: "bg-warning-bg text-warning border border-warning-border",
        danger: "bg-danger-bg text-danger border border-danger-border",
        info: "bg-info-bg text-info border border-info-border",
        outline: "text-foreground border border-border",
        secondary: "bg-surface-container text-muted-foreground",
        draft: "bg-surface-container-highest text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
