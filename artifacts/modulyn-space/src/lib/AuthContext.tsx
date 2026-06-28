import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "editor" | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  /** True while the initial session check is in progress. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ── Role helpers ──────────────────────────────────────────────────────────────

/** Editor and Admin can mutate content. Viewer is read-only. */
export function canEdit(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "editor";
}

/** Only Admin can manage users and global settings. */
export function isAdmin(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

// ── Profile fetcher ───────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<{
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
}> {
  const { data, error } = await supabase
    .from("users")
    .select("full_name, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    // Table may not exist yet (pre-migration). Silently default to viewer.
    console.warn("[AuthContext] Could not fetch user profile:", error.message);
    return { fullName: null, avatarUrl: null, role: "viewer" };
  }

  if (!data) {
    // Authenticated user has no profile row yet — treat as viewer.
    return { fullName: null, avatarUrl: null, role: "viewer" };
  }

  return {
    fullName:  data.full_name  ?? null,
    avatarUrl: data.avatar_url ?? null,
    role:      (data.role as UserRole) ?? "viewer",
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Build an AuthUser from Supabase session + public.users profile
  const hydrateUser = useCallback(async (sess: Session) => {
    const { id, email } = sess.user;
    const profile = await fetchProfile(id);
    setUser({
      id,
      email: email ?? "",
      fullName:  profile.fullName,
      avatarUrl: profile.avatarUrl,
      role:      profile.role,
    });
    setSession(sess);
  }, []);

  // ── Bootstrap: restore session on mount ───────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      if (cancelled) return;
      if (sess) {
        await hydrateUser(sess);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, sess) => {
        if (cancelled) return;

        if (event === "SIGNED_OUT" || !sess) {
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await hydrateUser(sess);
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrateUser]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      // ── DIAGNOSTIC (remove after root cause identified) ───────────────────
      if (error) {
        console.error("[Auth:diag] signInWithPassword FULL ERROR:", JSON.stringify({
          name:    error.name,
          message: error.message,
          status:  error.status,
          code:    (error as Record<string, unknown>).code,
          details: (error as Record<string, unknown>).details,
          hint:    (error as Record<string, unknown>).hint,
          __isAuthError: (error as Record<string, unknown>).__isAuthError,
        }, null, 2));
      } else {
        console.info("[Auth:diag] signInWithPassword SUCCESS");
      }
      // ─────────────────────────────────────────────────────────────────────
      if (error) {
        // Normalise common Supabase error messages
        if (error.message.toLowerCase().includes("invalid login")) {
          return { error: "Incorrect email or password. Please try again." };
        }
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return { error: "Your email address has not been confirmed. Please check your inbox." };
        }
        return { error: error.message };
      }
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT will clear state
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
