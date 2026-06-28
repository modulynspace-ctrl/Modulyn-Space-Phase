import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export type NotificationSource = "contact_request" | "consultation_booking";

export interface Notification {
  id: string;
  source: NotificationSource;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}

const FETCH_LIMIT = 15;
const FALLBACK_UUID = "00000000-0000-0000-0000-000000000000";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const [{ data: contacts }, { data: bookings }] = await Promise.all([
      supabase
        .from("contact_requests")
        .select("id, name, project_type, created_at")
        .order("created_at", { ascending: false })
        .limit(FETCH_LIMIT),
      supabase
        .from("consultation_bookings")
        .select("id, name, project_type, preferred_date, created_at")
        .order("created_at", { ascending: false })
        .limit(FETCH_LIMIT),
    ]);

    const allSourceIds = [
      ...(contacts ?? []).map((c) => c.id as string),
      ...(bookings ?? []).map((b) => b.id as string),
    ];

    const { data: reads } = await supabase
      .from("notification_reads")
      .select("source, source_id")
      .eq("user_id", user.id)
      .in("source_id", allSourceIds.length > 0 ? allSourceIds : [FALLBACK_UUID]);

    const readSet = new Set<string>(
      (reads ?? []).map((r) => `${r.source}:${r.source_id}`)
    );

    const contactNotifs: Notification[] = (contacts ?? []).map((c) => ({
      id:          c.id as string,
      source:      "contact_request" as const,
      title:       "New Contact Request",
      description: `${c.name}${c.project_type ? ` · ${c.project_type}` : ""}`,
      createdAt:   c.created_at as string,
      isRead:      readSet.has(`contact_request:${c.id}`),
    }));

    const bookingNotifs: Notification[] = (bookings ?? []).map((b) => ({
      id:          b.id as string,
      source:      "consultation_booking" as const,
      title:       "Consultation Booked",
      description: `${b.name}${b.preferred_date ? ` · ${b.preferred_date}` : ""}`,
      createdAt:   b.created_at as string,
      isRead:      readSet.has(`consultation_booking:${b.id}`),
    }));

    const merged = [...contactNotifs, ...bookingNotifs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, FETCH_LIMIT);

    setNotifications(merged);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (source: NotificationSource, sourceId: string) => {
      if (!user) return;
      const { error } = await supabase.from("notification_reads").upsert(
        { user_id: user.id, source, source_id: sourceId },
        { onConflict: "user_id,source,source_id" }
      );
      if (!error) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.source === source && n.id === sourceId ? { ...n, isRead: true } : n
          )
        );
      }
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    const { error } = await supabase.from("notification_reads").upsert(
      unread.map((n) => ({ user_id: user.id, source: n.source, source_id: n.id })),
      { onConflict: "user_id,source,source_id" }
    );
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  }, [user, notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications };
}
