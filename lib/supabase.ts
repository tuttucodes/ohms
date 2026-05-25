import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase is optional. When the env vars are present the store uses Postgres
 * for orders + products and Supabase Auth for admin. When absent, the app falls
 * back to the bundled catalogue and a local file order store, so it runs with
 * zero configuration.
 */
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);

let adminClient: SupabaseClient | null = null;

/** Service-role client for trusted server-side writes (orders, admin). */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return adminClient;
}
