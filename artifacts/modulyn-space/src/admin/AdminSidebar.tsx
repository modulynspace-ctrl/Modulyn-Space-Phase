import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FolderOpen,
  Image as ImageIcon,
  ShoppingBag,
  Wrench,
  Quote,
  Mail,
  CalendarCheck,
  HelpCircle,
  Users,
  Package,
  Settings,
  UserCog,
  LogOut,
  X,
} from "lucide-react";
import { useAuth, isAdmin as checkIsAdmin, canEdit } from "@/lib/AuthContext";

// ── Nav item definition ───────────────────────────────────────────────────────

interface NavItem {
  label:       string;
  href:        string;
  icon:        React.ElementType;
  /** If true, only 'admin' role sees this item */
  adminOnly?:  boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",             href: "/admin",            icon: LayoutDashboard },
  { label: "Projects",              href: "/admin/projects",   icon: FolderOpen },
  { label: "Media Library",         href: "/admin/media",      icon: ImageIcon },
  { label: "Store",                 href: "/admin/store",      icon: ShoppingBag },
  { label: "Services",              href: "/admin/services",   icon: Wrench },
  { label: "Testimonials",          href: "/admin/testimonials", icon: Quote },
  { label: "Contact Requests",      href: "/admin/contacts",   icon: Mail },
  { label: "Consultation Bookings", href: "/admin/bookings",   icon: CalendarCheck },
  { label: "FAQs",                  href: "/admin/faqs",       icon: HelpCircle },
  { label: "Team",                  href: "/admin/team",       icon: Users },
  { label: "Material Brands",       href: "/admin/brands",     icon: Package },
  { label: "Website Settings",      href: "/admin/settings",   icon: Settings,  adminOnly: true },
  { label: "Users",                 href: "/admin/users",      icon: UserCog,   adminOnly: true },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen:    boolean;
  setIsOpen: (val: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location]    = useLocation();
  const { user, signOut } = useAuth();

  const role = user?.role ?? "viewer";

  // Filter nav items based on role
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !checkIsAdmin(role)) return false;
    return true;
  });

  async function handleSignOut() {
    await signOut();
    // onAuthStateChange will clear state; ProtectedRoute redirects to /admin/login
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-[#fcfbf9] border-r border-border flex flex-col z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
        <div>
          <Link href="/admin" className="font-serif tracking-widest uppercase font-semibold text-primary text-sm">
            Modulyn Space
          </Link>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Admin Panel</div>
        </div>
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {visibleItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <div className="w-1 h-5 bg-primary absolute left-0 rounded-r" />
                )}
                <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Role badge + logout */}
      <div className="p-4 border-t border-border/50 mt-auto space-y-2">
        {user && (
          <div className="px-3 py-1.5">
            <p className="text-xs font-medium text-foreground/70 truncate">
              {user.fullName ?? user.email.split("@")[0]}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              {role}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
