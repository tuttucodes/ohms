import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-pill)] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        sale: "bg-coral-500 text-white",
        leaf: "bg-leaf-100 text-leaf-800",
        new: "bg-leaf-600 text-white",
        outline: "border border-border text-muted",
        stock: "bg-amber-100 text-amber-800",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.65rem]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "leaf", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
