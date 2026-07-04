import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FormSectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ id, icon: Icon, title, children, className }: FormSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-border bg-surface shadow-sm p-6 scroll-mt-24",
        className
      )}
    >
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-border">
        <Icon className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}
