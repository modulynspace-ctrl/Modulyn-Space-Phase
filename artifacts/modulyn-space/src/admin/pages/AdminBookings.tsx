import React, { useEffect, useState, useCallback } from "react";
import { CalendarCheck, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Booking {
  id:             string;
  name:           string;
  email:          string;
  phone:          string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  location:       string | null;
  project_type:   string | null;
  message:        string | null;
  status:         BookingStatus;
  notes:          string | null;
  created_at:     string;
  updated_at:     string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  cancelled:  "Cancelled",
  completed:  "Completed",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-zinc-100 text-zinc-500 border-zinc-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  residential_full: "Full Home Interior",
  kitchen_wardrobe: "Kitchen & Wardrobes",
  renovation:       "Renovation",
  commercial:       "Commercial/Office",
  other:            "Other",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as BookingStatus[];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

function formatPreferredDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  // dateStr is YYYY-MM-DD; parse without timezone shift
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminBookings() {
  const [bookings, setBookings]       = useState<Booking[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [updatingId, setUpdatingId]   = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("consultation_bookings")
      .select(
        "id, name, email, phone, preferred_date, preferred_time, location, project_type, message, status, notes, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("[AdminBookings] fetch error:", fetchError);
      setError("Could not load bookings. Check your Supabase connection and RLS policies.");
      setLoading(false);
      return;
    }

    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Status update ──────────────────────────────────────────────────────────

  async function handleStatusChange(id: string, newStatus: BookingStatus) {
    setUpdatingId(id);
    setUpdateError(null);

    const { error: updateErr } = await supabase
      .from("consultation_bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (updateErr) {
      console.error("[AdminBookings] update error:", updateErr);
      setUpdateError(`Failed to update status. ${updateErr.message}`);
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    }

    setUpdatingId(null);
  }

  // ── Counts by status ───────────────────────────────────────────────────────

  const pendingCount   = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium text-foreground mb-2">Consultation Bookings</h1>
          <p className="text-muted-foreground">Scheduled consultation appointments from the website</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Update error banner */}
      {updateError && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{updateError}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-border rounded-xl flex items-center justify-center min-h-[320px]">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Loading bookings…</p>
          </div>
        </div>
      )}

      {/* Fetch error */}
      {!loading && error && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center text-center min-h-[320px] p-10 gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-medium mb-1">Unable to load bookings</h2>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          </div>
          <Button variant="outline" onClick={fetchBookings} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && bookings.length === 0 && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center text-center min-h-[400px] p-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CalendarCheck className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-medium mb-2">No bookings yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Consultation bookings from the website will appear here once visitors book an appointment.
          </p>
        </div>
      )}

      {/* Bookings table */}
      {!loading && !error && bookings.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">

          {/* Summary bar */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"} total
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                  {pendingCount} pending
                </span>
              )}
              {confirmedCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  {confirmedCount} confirmed
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Name</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Email</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Phone</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Preferred Date</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Preferred Time</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Project Type</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Received</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/20 transition-colors">

                    {/* Name */}
                    <td className="px-5 py-4 font-medium text-foreground whitespace-nowrap">
                      {b.name}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-muted-foreground">
                      <a href={`mailto:${b.email}`} className="hover:text-primary transition-colors">
                        {b.email}
                      </a>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {b.phone
                        ? <a href={`tel:${b.phone}`} className="hover:text-primary transition-colors">{b.phone}</a>
                        : <span className="text-border">—</span>}
                    </td>

                    {/* Preferred date */}
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {formatPreferredDate(b.preferred_date)}
                    </td>

                    {/* Preferred time */}
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {b.preferred_time ?? <span className="text-border">—</span>}
                    </td>

                    {/* Project type */}
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {b.project_type
                        ? (PROJECT_TYPE_LABELS[b.project_type] ?? b.project_type)
                        : <span className="text-border">—</span>}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Received date */}
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(b.created_at)}
                    </td>

                    {/* Status dropdown */}
                    <td className="px-5 py-4">
                      <div className="relative">
                        {updatingId === b.id && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/70 rounded">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                        <Select
                          value={b.status}
                          onValueChange={(val) => handleStatusChange(b.id, val as BookingStatus)}
                          disabled={updatingId === b.id}
                        >
                          <SelectTrigger className="h-8 text-xs w-36 rounded-md border-border/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {STATUS_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
