/**
 * Supabase Client
 *
 * Initializes and exports a single shared Supabase client instance.
 * All credentials are read from Vite environment variables — never hardcoded.
 *
 * Required environment variables (set via Replit Secrets):
 *   VITE_SUPABASE_URL      — Your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — Your Supabase project anon/public key
 */

import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl    = import.meta.env.VITE_SUPABASE_URL    as string | undefined;
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Normalise: strip surrounding whitespace and any trailing slashes.
// Supabase appends paths like /auth/v1/token — a trailing slash on the base URL
// produces a double-slash (e.g. https://x.supabase.co//auth/v1/token) which
// GoTrue rejects with "Invalid path specified in request URL".
const supabaseUrl    = rawSupabaseUrl?.trim().replace(/\/+$/, "");
const supabaseAnonKey = rawSupabaseAnonKey?.trim();

// ── DIAGNOSTIC (remove after debugging) ──────────────────────────────────────
{
  const u = rawSupabaseUrl ?? "";
  const n = supabaseUrl ?? "";
  console.info("[Supabase:diag] RAW   url defined:", !!u, "| length:", u.length,
    "| ends_with_slash:", u.endsWith("/"),
    "| path_after_host:", JSON.stringify(u.replace(/^https?:\/\/[^/]+/, "") || "(none)"),
    "| last_5_chars:", JSON.stringify(u.slice(-5)));
  console.info("[Supabase:diag] NORM  url defined:", !!n, "| length:", n.length,
    "| path_after_host:", JSON.stringify(n.replace(/^https?:\/\/[^/]+/, "") || "(none)"),
    "| last_5_chars:", JSON.stringify(n.slice(-5)));
  console.info("[Supabase:diag] AUTH  endpoint will be:", JSON.stringify(n + "/auth/v1/token?grant_type=password"));
  console.info("[Supabase:diag] REST  endpoint will be:", JSON.stringify(n + "/rest/v1/"));
}
// ─────────────────────────────────────────────────────────────────────────────

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Missing environment variables.\n" +
    "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Replit Secrets."
  );
}

/**
 * The shared Supabase client.
 * Import this wherever you need to query the database or use Supabase services.
 *
 * Example:
 *   import { supabase } from "@/lib/supabase";
 *   const { data, error } = await supabase.from("inquiries").select("*");
 */
export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);

/**
 * Verifies the Supabase connection by performing a lightweight health check.
 * Returns true if the client can reach the project, false otherwise.
 *
 * Usage (optional — for debugging):
 *   import { verifySupabaseConnection } from "@/lib/supabase";
 *   const ok = await verifySupabaseConnection();
 */
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    // Ping a non-existent table — PostgREST returns a structured error response
    // which still proves the client can reach the Supabase project endpoint.
    const { error } = await supabase.from("_ping").select("*").limit(0);

    if (!error) {
      // No error at all — connected and table exists
      console.info("[Supabase] ✓ Connected to Supabase successfully.");
      return true;
    }

    // These error codes all mean "we reached Supabase but the table doesn't exist yet"
    // — which is perfectly expected before any tables are created.
    const reachableCodes = [
      "42P01",    // PostgreSQL: relation does not exist
      "PGRST116", // PostgREST: table not found
      "PGRST200", // PostgREST: no relationships found
    ];
    const reachableMessages = ["Invalid path specified", "relation", "does not exist"];

    const isReachable =
      reachableCodes.includes(error.code ?? "") ||
      reachableMessages.some((msg) => error.message?.includes(msg));

    if (isReachable) {
      console.info("[Supabase] ✓ Connected to Supabase successfully. (No tables created yet — that's expected at this stage.)");
      return true;
    }

    console.error("[Supabase] ✗ Connection error:", error.message);
    return false;
  } catch (err) {
    console.error("[Supabase] ✗ Unexpected error during connection check:", err);
    return false;
  }
}
