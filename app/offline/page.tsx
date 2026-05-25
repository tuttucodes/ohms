import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're offline · OHMS",
  description: "OHMS is offline. Browsing resumes when you're back online.",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-16 text-center text-foreground">
      <div className="flex max-w-sm flex-col items-center gap-6">
        {/* Centered OHMS leaf mark */}
        <span
          className="flex h-24 w-24 items-center justify-center rounded-full bg-leaf-100 shadow-soft"
          aria-hidden="true"
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="OHMS leaf"
          >
            <path
              d="M40 82 C42 50 64 32 92 32 C80 39 75 51 73 63 C90 48 100 50 100 50 C97 68 80 86 55 84 C50 83 45 83 40 82 Z"
              fill="#5aa630"
            />
            <path
              d="M42 84 C47 64 57 49 74 40"
              stroke="#2f6f22"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M42 83 C37 69 42 52 53 43"
              stroke="#a9743f"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-leaf-700">
            You&apos;re offline
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted">
            We can&apos;t reach the internet right now. Check your connection
            and the soft little things will be back in a moment.
          </p>
          <p className="text-sm text-leaf-600">
            Browsing resumes automatically as soon as you&apos;re back online.
          </p>
        </div>
      </div>
    </main>
  );
}
