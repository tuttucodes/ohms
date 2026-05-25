import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  images: string[];
}

export function Hero({ images }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="leaf-gradient grain absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-3 py-1.5 text-xs font-semibold text-leaf-700 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            New season · gentle on little ones
          </span>
          <h1 className="mt-4 text-[clamp(2.5rem,1.5rem+6vw,5rem)] leading-[0.98] text-leaf-900">
            Soft as a hug,
            <br />
            <span className="text-leaf-600">comfy</span> all day.
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-leaf-900/70 sm:text-lg">
            Thoughtfully made clothing and essentials for babies and kids.
            Breathable fabrics, playful prints, and the kind of softness little
            ones deserve.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="primary">
              <Link href="/shop">
                Shop the collection
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/shop?onSale=1">Today&apos;s deals</Link>
            </Button>
          </div>
          <dl className="mt-10 flex gap-8">
            {[
              ["900+", "Soft styles"],
              ["100%", "Skin-friendly"],
              ["15 day", "Easy returns"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-bold text-leaf-800">
                  {n}
                </dt>
                <dd className="text-xs text-leaf-900/60">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Bento image cluster */}
        <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            {images[0] && (
              <Image
                src={images[0]}
                alt="OHMS kidswear"
                fill
                priority
                sizes="(max-width:1024px) 45vw, 25vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:gap-4">
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
              {images[1] && (
                <Image
                  src={images[1]}
                  alt="OHMS baby essentials"
                  fill
                  sizes="(max-width:1024px) 45vw, 25vw"
                  className="object-cover"
                />
              )}
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft)]">
              {images[2] && (
                <Image
                  src={images[2]}
                  alt="OHMS soft cottons"
                  fill
                  sizes="(max-width:1024px) 45vw, 25vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
