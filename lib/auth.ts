import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/*
  Lightweight admin session. A signed, expiring token is stored in an httpOnly
  cookie. The login route validates ADMIN_PASSWORD and issues the token; server
  components and the middleware verify it.

  Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in the environment for production.
  Sensible dev defaults are used when unset (with the understanding that they
  must be overridden before going live).
*/

export const ADMIN_COOKIE = "ohms_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "ohms-admin";
}

function getSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    "ohms-dev-session-secret-change-me-in-production"
  );
}

export function createSessionToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(String(exp))
    .digest("hex");
  return `${exp}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(expStr)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};

/** True when the current request carries a valid admin session. */
export async function isAdminRequest(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}
