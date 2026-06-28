import React, { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Mail, Calendar, Check, CheckCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotifications,
  type Notification,
  type NotificationSource,
} from "@/admin/hooks/useNotifications";

// ── Relative time ─────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins  <  1)  return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  const hrs  = Math.floor(mins  / 60);
  if (hrs   < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs   / 24);
  if (days  ===  1) return "yesterday";
  if (days  <   7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ── Source icon ───────────────────────────────────────────────────────────────

function SourceIcon({ source }: { source: NotificationSource }) {
  if (source === "contact_request") {
    return (
      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        <Mail className="w-4 h-4 text-blue-600" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <Calendar className="w-4 h-4 text-primary" />
    </div>
  );
}

// ── Single notification row ───────────────────────────────────────────────────

function NotificationRow({
  notification,
  onNavigate,
  onMarkRead,
}: {
  notification: Notification;
  onNavigate:   (source: NotificationSource) => void;
  onMarkRead:   (source: NotificationSource, id: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(notification.source)}
      onKeyDown={(e) => e.key === "Enter" && onNavigate(notification.source)}
      className={[
        "relative flex items-start gap-3 px-4 py-3 cursor-pointer group",
        "hover:bg-secondary/40 transition-colors focus:outline-none focus:bg-secondary/40",
        !notification.isRead ? "bg-primary/[0.03]" : "",
      ].join(" ")}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      <SourceIcon source={notification.source} />

      <div className="flex-1 min-w-0 pr-1">
        <p
          className={[
            "text-sm leading-snug truncate",
            notification.isRead
              ? "text-muted-foreground font-normal"
              : "text-foreground font-medium",
          ].join(" ")}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {notification.description}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {relativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notification.source, notification.id);
          }}
          title="Mark as read"
          className={[
            "shrink-0 mt-0.5 p-1 rounded",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-primary/10 text-primary",
          ].join(" ")}
          aria-label="Mark as read"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Dropdown panel ────────────────────────────────────────────────────────────

const panelVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  shown:  { opacity: 1, y:  0, scale: 1    },
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  function handleNavigate(source: NotificationSource) {
    setOpen(false);
    navigate(source === "contact_request" ? "/admin/contacts" : "/admin/bookings");
  }

  return (
    <div className="relative">
      {/* ── Bell button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className="relative text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="w-5 h-5" />

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Dropdown ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Click-outside backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              key="panel"
              variants={panelVariants}
              initial="hidden"
              animate="shown"
              exit="hidden"
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Body */}
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-[22rem] overflow-y-auto divide-y divide-border">
                  {notifications.map((n) => (
                    <NotificationRow
                      key={`${n.source}:${n.id}`}
                      notification={n}
                      onNavigate={handleNavigate}
                      onMarkRead={markAsRead}
                    />
                  ))}
                </div>
              )}

              {/* Footer */}
              {!loading && notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2.5 flex gap-4">
                  <button
                    onClick={() => { setOpen(false); navigate("/admin/contacts"); }}
                    className="text-xs text-primary hover:text-primary/70 transition-colors"
                  >
                    Contacts →
                  </button>
                  <button
                    onClick={() => { setOpen(false); navigate("/admin/bookings"); }}
                    className="text-xs text-primary hover:text-primary/70 transition-colors"
                  >
                    Bookings →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
