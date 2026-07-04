"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableCodeProps {
  label: string;
  value: string;
  size?: "md" | "lg";
  className?: string;
}

function CopyableCode({ label, value, size = "md", className }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value.replace(/\s+/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "bg-surface-container-low border border-border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
        className
      )}
    >
      <div>
        <span className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
          {label}
        </span>
        <p
          className={cn(
            "font-mono font-bold text-primary tracking-wider",
            size === "lg" ? "text-2xl" : "text-lg"
          )}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors shrink-0"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

export { CopyableCode };
