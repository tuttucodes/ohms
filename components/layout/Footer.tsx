import Link from "next/link";
import { Mail, Phone, Leaf } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/brand/SocialIcons";
import { siteConfig, SHOP_NAV } from "@/lib/config";

const help = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping & Delivery", href: "/policies/shipping" },
  { label: "Returns & Exchange", href: "/policies/returns" },
  { label: "Track Order", href: "/account" },
];

const company = [
  { label: "About OHMS", href: "/about" },
  { label: "Our Promise", href: "/about#promise" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms of Service", href: "/policies/terms" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface-sunken">
      {/* Trust strip */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4">
          {[
            ["Soft on skin", "Gentle, breathable fabrics"],
            ["Made for play", "Durable, tested for little ones"],
            ["Free shipping", `On orders over ₹${siteConfig.shipping.freeAbove}`],
            ["Easy returns", "15-day hassle-free returns"],
          ].map(([title, sub]) => (
            <div key={title} className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700">
                <Leaf className="h-4 w-4" /> {title}
              </span>
              <span className="text-xs text-muted">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {siteConfig.description}
          </p>
          <div className="mt-5 flex gap-2">
            {[
              [siteConfig.social.instagram, InstagramIcon, "Instagram"],
              [siteConfig.social.facebook, FacebookIcon, "Facebook"],
              [siteConfig.social.youtube, YoutubeIcon, "YouTube"],
            ].map(([href, Icon, label]) => {
              const I = Icon as typeof InstagramIcon;
              return (
                <a
                  key={label as string}
                  href={href as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label as string}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-leaf-700 transition-colors hover:bg-leaf-50"
                >
                  <I className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <FooterCol title="Shop" links={SHOP_NAV.slice(0, 6).map((n) => ({
          label: n.label,
          href: n.subcategory
            ? `/shop?subcategory=${encodeURIComponent(n.subcategory)}`
            : n.category
              ? `/shop?category=${encodeURIComponent(n.category)}`
              : "/shop",
        }))} />
        <FooterCol title="Help" links={help} />
        <FooterCol title="Company" links={company} />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-1.5 hover:text-leaf-700">
              <Mail className="h-3.5 w-3.5" /> {siteConfig.contact.email}
            </a>
            <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-leaf-700">
              <Phone className="h-3.5 w-3.5" /> {siteConfig.contact.phone}
            </a>
          </div>
        </div>
        <div className="border-t border-border/60 py-3 text-center text-[0.7rem] text-muted/80">
          Developed by{" "}
          <span className="font-semibold text-leaf-700">Kernel &amp; Oak</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-leaf-700"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
