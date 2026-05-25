/**
 * Renders JSON-LD structured data. Content is built only from our own
 * server-side data (siteConfig, catalogue products) — never user HTML — and
 * `<` is escaped so values cannot break out of the script tag. This is the
 * standard, safe JSON-LD pattern recommended by Next.js.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
