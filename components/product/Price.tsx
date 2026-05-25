import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";

interface PriceProps {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { now: "text-sm", was: "text-xs", off: "text-[0.65rem]" },
  md: { now: "text-lg", was: "text-sm", off: "text-xs" },
  lg: { now: "text-3xl", was: "text-lg", off: "text-sm" },
};

export function Price({ price, mrp, size = "md", className }: PriceProps) {
  const hasDiscount = mrp > price;
  const off = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const s = sizeMap[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold text-foreground", s.now)}>
        {formatINR(price)}
      </span>
      {hasDiscount && (
        <>
          <span className={cn("text-muted line-through", s.was)}>
            {formatINR(mrp)}
          </span>
          <span className={cn("font-semibold text-coral-600", s.off)}>
            {off}% off
          </span>
        </>
      )}
    </div>
  );
}
