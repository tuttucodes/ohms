"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Login failed");
      router.replace(params.get("from") ?? "/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-lift)]"
    >
      <div className="flex flex-col items-center text-center">
        <Logo href={null} className="h-12" />
        <h1 className="mt-5 text-2xl">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Manage products and orders</p>
      </div>
      <div className="mt-6">
        <label className="mb-1.5 block text-sm font-medium">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          autoFocus
          className={error ? "border-coral-500" : ""}
        />
        {error && <p className="mt-2 text-sm text-coral-600">{error}</p>}
      </div>
      <Button type="submit" size="lg" disabled={loading} className="mt-5 w-full">
        <Lock className="h-4 w-4" />
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 text-center text-xs text-muted">
          Default dev password: <code className="font-mono">ohms-admin</code>
        </p>
      )}
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-leaf-50 px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
