import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { Search, Bell, Menu, ChevronDown, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  // Fall back to first two chars of email local-part
  return email.split("@")[0].slice(0, 2).toUpperCase();
}

function getDisplayName(name: string | null, email: string): string {
  return name ?? email.split("@")[0];
}

const ROLE_LABELS: Record<string, string> = {
  admin:  "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

// ── Page title map ────────────────────────────────────────────────────────────

function getTitle(location: string): string {
  if (location === "/admin")              return "Dashboard";
  const segment = location.split("/").pop() ?? "";
  const map: Record<string, string> = {
    projects:     "Projects",
    media:        "Media Library",
    store:        "Modulyn Store",
    services:     "Services",
    testimonials: "Testimonials",
    contacts:     "Contact Requests",
    bookings:     "Consultation Bookings",
    faqs:         "FAQs",
    team:         "Team",
    brands:       "Material Brands",
    settings:     "Website Settings",
    users:        "Users",
  };
  return map[segment] ?? (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
}

// ── User dropdown ─────────────────────────────────────────────────────────────

interface DropdownProps {
  open: boolean;
  onClose: () => void;
  displayName: string;
  email: string;
  role: string;
  onSignOut: () => void;
}

function UserDropdown({ open, onClose, displayName, email, role, onSignOut }: DropdownProps) {
  if (!open) return null;
  return (
    <>
      {/* Click-outside backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
        {/* User info */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
              {getInitials(displayName, email)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-block text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="py-1">
          <button
            onClick={() => { onClose(); onSignOut(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

// ── AdminHeader ───────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = user ? getDisplayName(user.fullName, user.email) : "";
  const initials    = user ? getInitials(user.fullName, user.email)    : "?";
  const role        = user?.role ?? "viewer";

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-8 z-30 shadow-sm">

      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-lg font-medium hidden md:block">{getTitle(location)}</h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="pl-9 h-9 bg-secondary/50 border-transparent focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-muted-foreground hover:text-foreground" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            3
          </span>
        </button>

        <div className="w-px h-6 bg-border mx-1 hidden md:block" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm select-none">
                {initials}
              </div>
            )}
            <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground hidden md:block transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <UserDropdown
            open={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            displayName={displayName}
            email={user?.email ?? ""}
            role={role}
            onSignOut={signOut}
          />
        </div>
      </div>
    </header>
  );
}
