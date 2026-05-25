import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-leaf-600 text-white shadow-[var(--shadow-soft)] hover:bg-leaf-700 hover:shadow-[var(--shadow-lift)]",
        accent:
          "bg-coral-500 text-white shadow-[var(--shadow-soft)] hover:bg-coral-600",
        outline:
          "border border-leaf-600/30 bg-surface text-leaf-700 hover:bg-leaf-50 hover:border-leaf-600/60",
        ghost: "text-foreground hover:bg-surface-sunken",
        soft: "bg-leaf-100 text-leaf-800 hover:bg-leaf-200",
        dark: "bg-leaf-900 text-white hover:bg-leaf-800",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-[var(--radius-pill)]",
        md: "h-11 px-6 text-[0.95rem] rounded-[var(--radius-pill)]",
        lg: "h-14 px-8 text-base rounded-[var(--radius-pill)]",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
