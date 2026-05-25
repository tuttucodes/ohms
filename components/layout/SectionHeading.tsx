import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  hrefLabel = "View all",
}: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf-600">
            {eyebrow}
          </span>
        )}
        <h2 className="mt-1 text-[clamp(1.5rem,1rem+2vw,2.25rem)] text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 max-w-xl text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-leaf-700 transition-colors hover:bg-leaf-50 sm:inline-flex"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
