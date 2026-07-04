"use client";

import { cn } from "@/lib/utils";

export interface SegmentedTabsProps {
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

function SegmentedTabs({ options, value, onValueChange, className }: SegmentedTabsProps) {
  return (
    <div role="tablist" className={cn("inline-flex p-1 bg-surface-container-low rounded-lg", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all",
              isActive
                ? "bg-white shadow-sm text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { SegmentedTabs };
