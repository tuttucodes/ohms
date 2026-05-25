import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Heart, Sparkles, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { LinkedinIcon } from "@/components/brand/SocialIcons";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
};

const values = [
  {
    icon: Leaf,
    title: "Softness first",
    body: "We obsess over fabric. Breathable, gentle knits chosen for delicate skin.",
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
  const { founder } = siteConfig;
  const initials = founder.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div>
      <section className="leaf-gradient grain relative">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf-600">
            Our story
          </span>
          <h1 className="mt-3 text-[clamp(2.25rem,1.5rem+4vw,4rem)] text-leaf-900">
            Comfort, knitted in.
          </h1>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-leaf-900/70">
            OHMS is born in Tirupur — India&apos;s knitwear capital — where soft
            cotton and skilled hands have dressed the world for generations. We
            channel that craft into clothing made for the people who matter most:
            babies and kids. Soft, breathable, skin-friendly essentials that move
            with little ones through every nap, giggle and adventure.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-leaf-900/60">
            <MapPin className="h-4 w-4" /> {siteConfig.legalName} · Tirupur, India
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
                <h3 className="mt-4 font-display text-lg font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <div className="grid items-center gap-8 rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-10 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-leaf-100 font-display text-3xl font-bold text-leaf-700 shadow-[var(--shadow-soft)]">
              {initials}
            </div>
            <a
              href={founder.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-leaf-700 transition-colors hover:bg-leaf-50"
            >
              <LinkedinIcon className="h-4 w-4" /> Connect on LinkedIn
            </a>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf-600">
              From the founder
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              {founder.name}
            </h2>
            <p className="text-sm text-muted">{founder.role}, OHMS</p>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/80">
              &ldquo;We started OHMS with a simple idea — that the clothes closest
              to a child&apos;s skin should be the softest, safest and most
              comfortable of all. Rooted in Tirupur&apos;s knitwear heritage, every
              OHMS piece is made to feel like a hug and to last through real,
              playful childhoods.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <div className="rounded-[var(--radius-card)] bg-leaf-900 px-6 py-12 text-white">
          <Logo variant="mark" href={null} className="mx-auto h-14" />
          <h2 className="mt-4 text-section text-white">Soft And Comfort, always.</h2>
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
