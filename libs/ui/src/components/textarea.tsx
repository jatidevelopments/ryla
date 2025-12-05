"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          error
            ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
            : "border-white/10 focus:border-[#b99cff] focus:ring-1 focus:ring-[#b99cff]/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

