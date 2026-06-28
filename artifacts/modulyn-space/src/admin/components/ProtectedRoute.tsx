import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldOff } from "lucide-react";
import { useAuth, UserRole } from "@/lib/AuthContext";

// ── Spinner ───────────────────────────────────────────────────────────────────

function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm tracking-wide">Verifying session…</p>
      </div>
    </div>
  );
}

// ── Unauthorized ──────────────────────────────────────────────────────────────

function Unauthorized() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-32 text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <ShieldOff className="w-8 h-8 text-destructive" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-medium mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm">
          You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}

// ── ProtectedRoute ────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
  /** If set, only users with this role (or higher) may access. */
  requiredRole?: UserRole;
}

const ROLE_LEVEL: Record<UserRole, number> = {
  viewer: 0,
  editor: 1,
  admin:  2,
};

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading } = useAuth();
  const [, navigate]       = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    }
  }, [loading, user, navigate]);

  if (loading) return <AuthLoading />;
  if (!user)   return <AuthLoading />; // will redirect in effect

  // Role check
  if (requiredRole && ROLE_LEVEL[user.role] < ROLE_LEVEL[requiredRole]) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
