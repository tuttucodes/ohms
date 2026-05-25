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
 * OHMS brand logo. `full` shows the leaf badge + wordmark; `mark` is just the badge.
 * Drop a higher-fidelity /logo.svg or /public/logo.png to override the vector art.
 */
export function Logo({
  variant = "full",
  className,
  href = "/",
  priority = false,
}: LogoProps) {
  const src = variant === "mark" ? "/logo-mark.svg" : "/logo.svg";
  const width = variant === "mark" ? 44 : 150;
  const height = variant === "mark" ? 44 : 56;

  const img = (
    <Image
      src={src}
      alt="OHMS — Soft And Comfort"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
    />
  );

  if (href === null) return img;
  return (
    <Link href={href} aria-label="OHMS home" className="inline-flex items-center">
      {img}
    </Link>
  );
}
