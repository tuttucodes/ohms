import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Heart, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
};

const values = [
  {
    icon: Leaf,
    title: "Softness first",
    body: "We obsess over fabric. Breathable, gentle weaves chosen for delicate skin.",
  },
  {
    icon: Heart,
    title: "Made with care",
    body: "Thoughtful details, safe finishes, and prints that spark a little joy.",
  },
  {
    icon: Sparkles,
    title: "Built for play",
    body: "Durable enough for tumbles, naps, snacks and everything in between.",
  },
  {
    icon: ShieldCheck,
    title: "Parent-approved",
    body: "Easy-care, value-driven essentials you can buy again and again.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="leaf-gradient grain relative">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Our story
          </span>
          <h1 className="mt-3 text-[clamp(2.25rem,1.5rem+4vw,4rem)] text-leaf-900">
            Comfort, woven in.
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-leaf-900/70">
            OHMS began with a simple belief: little ones deserve clothing that
            feels as good as a cuddle. We make soft, breathable, skin-friendly
            essentials that move with babies and kids through every nap, giggle
            and adventure.
          </p>
        </div>
      </section>

      <section id="promise" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-section">Our promise</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf-100 text-leaf-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {v.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {v.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <div className="rounded-[var(--radius-card)] bg-leaf-900 px-6 py-12 text-white">
          <h2 className="text-section text-white">Soft And Comfort, always.</h2>
          <p className="mx-auto mt-3 max-w-md text-leaf-100/80">
            Explore the collection and find your little one&apos;s next favourite.
          </p>
          <Button asChild size="lg" variant="accent" className="mt-6">
            <Link href="/shop">Shop the collection</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
