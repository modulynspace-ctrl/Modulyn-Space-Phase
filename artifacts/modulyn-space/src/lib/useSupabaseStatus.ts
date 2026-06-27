/**
 * useSupabaseStatus
 *
 * A one-time development hook that verifies the Supabase connection on app
 * startup and logs the result to the browser console.
 *
 * Used only in App.tsx during the loading phase — remove once you're confident
 * the connection is stable.
 */

import { useEffect } from "react";
import { verifySupabaseConnection } from "@/lib/supabase";

export function useSupabaseStatus() {
  useEffect(() => {
    verifySupabaseConnection().then((ok) => {
      if (ok) {
        console.info("[Supabase] ✓ Connected to Supabase successfully.");
      } else {
        console.error("[Supabase] ✗ Could not connect. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      }
    });
  }, []);
}
