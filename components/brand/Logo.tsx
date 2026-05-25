import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
  href?: string | null;
  priority?: boolean;
}

/**
 * OHMS brand logo built from the real leaf mark (public/ohms-logo.png).
 * `full` = mark + "OHMS / Soft And Comfort" wordmark; `mark` = just the badge.
 * Pass a height via `className` (e.g. "h-10"); the mark scales to fill it.
 */
export function Logo({
  variant = "full",
  className,
  href = "/",
  priority = false,
}: LogoProps) {
  const height = className ?? "h-10";

  const mark = (
    <Image
      src="/ohms-logo.png"
      alt="OHMS"
      width={120}
      height={120}
      priority={priority}
      className="h-full w-auto select-none"
    />
  );

  const content =
    variant === "mark" ? (
      <span className={cn("inline-flex", height)}>{mark}</span>
    ) : (
      <span className={cn("inline-flex items-center gap-2", height)}>
        {mark}
        <span className="flex flex-col justify-center leading-none">
          <span className="font-display text-xl font-bold tracking-tight text-leaf-700 sm:text-2xl">
            OHMS
          </span>
          <span className="mt-0.5 text-[0.55rem] font-medium uppercase tracking-[0.16em] text-foreground/70">
            Soft And Comfort
          </span>
        </span>
      </span>
    );

  if (href === null) return content;
  return (
    <Link href={href} aria-label="OHMS home" className="inline-flex items-center">
      {content}
    </Link>
  );
}
