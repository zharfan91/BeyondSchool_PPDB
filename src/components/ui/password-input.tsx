"use client";

import * as React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "@/components/ui/input";

export type PasswordInputProps = Omit<InputProps, "type">;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none" />
        <Input
          type={visible ? "text" : "password"}
          className={cn("pl-10 pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-foreground transition-colors"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
