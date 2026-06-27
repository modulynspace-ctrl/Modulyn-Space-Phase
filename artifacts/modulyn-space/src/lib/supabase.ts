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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
    // A simple ping — selecting 0 rows from a system view is always safe
    const { error } = await supabase.from("_supabase_health_check_ping").select("*").limit(0);

    // A "relation does not exist" error still means the connection is alive
    if (error && error.code !== "42P01" && error.code !== "PGRST116") {
      console.error("[Supabase] Connection error:", error.message);
      return false;
    }

    console.info("[Supabase] Connection verified successfully.");
    return true;
  } catch (err) {
    console.error("[Supabase] Unexpected error during connection check:", err);
    return false;
  }
}
