import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-2xl border border-border bg-surface px-4 text-[0.95rem] text-foreground",
        "placeholder:text-muted/70 transition-colors",
        "focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[0.95rem] text-foreground",
        "placeholder:text-muted/70 transition-colors",
        "focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
