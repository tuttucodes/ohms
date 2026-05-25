import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { POLICIES, POLICY_SLUGS } from "@/lib/policies";

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  return { title: policy?.title ?? "Policy" };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-[clamp(1.75rem,1rem+3vw,2.5rem)]">{policy.title}</h1>
      <p className="mt-1 text-sm text-muted">Last updated {policy.updated}</p>

      <div className="mt-8 space-y-8">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {section.heading}
            </h2>
            <div className="mt-2 space-y-2">
              {section.body.map((p, i) => (
                <p key={i} className="leading-relaxed text-foreground/80">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
