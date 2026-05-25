import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div>
        <Logo href="/" className="mx-auto h-12" />
        <h1 className="mt-8 font-display text-7xl font-bold text-leaf-600">404</h1>
        <p className="mt-2 text-xl font-semibold">This page wandered off.</p>
        <p className="mt-1 text-muted">
          Let&apos;s get you back to something soft and comfy.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Shop all</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
