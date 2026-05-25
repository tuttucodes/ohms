import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the OHMS care team.",
};

export default function ContactPage() {
  const details = [
    { icon: Mail, label: "Email", value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` },
    { icon: Phone, label: "Phone", value: siteConfig.contact.phone, href: `tel:${siteConfig.contact.phone}` },
    { icon: MessageCircle, label: "WhatsApp", value: siteConfig.contact.whatsapp, href: "#" },
    { icon: MapPin, label: "Address", value: siteConfig.contact.address, href: "#" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf-600">
          We&apos;re here to help
        </span>
        <h1 className="mt-2 text-[clamp(1.75rem,1rem+3vw,2.75rem)]">Contact us</h1>
        <p className="mt-2 text-muted">
          Questions about sizing, orders or returns? Our care team usually replies
          within one business day.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          {details.map((d) => {
            const Icon = d.icon;
            return (
              <a
                key={d.label}
                href={d.href}
                className="flex items-start gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-4 transition-colors hover:border-leaf-300"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-wide text-muted">
                    {d.label}
                  </span>
                  <span className="block text-sm font-medium text-foreground">
                    {d.value}
                  </span>
                </span>
              </a>
            );
          })}
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Send a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
