import React, { useEffect, useState, useCallback } from "react";
import { Mail, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
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

type ContactStatus =
  | "new"
  | "contacted"
  | "site_visit_scheduled"
  | "proposal_sent"
  | "work_started"
  | "completed"
  | "closed";

interface ContactRequest {
  id:           string;
  name:         string;
  email:        string;
  phone:        string | null;
  project_type: string | null;
  message:      string | null;
  status:       ContactStatus;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ContactStatus, string> = {
  new:                   "New",
  contacted:             "Contacted",
  site_visit_scheduled:  "Site Visit Scheduled",
  proposal_sent:         "Proposal Sent",
  work_started:          "Work Started",
  completed:             "Completed",
  closed:                "Closed",
};

const STATUS_COLORS: Record<ContactStatus, string> = {
  new:                   "bg-blue-50 text-blue-700 border-blue-200",
  contacted:             "bg-amber-50 text-amber-700 border-amber-200",
  site_visit_scheduled:  "bg-violet-50 text-violet-700 border-violet-200",
  proposal_sent:         "bg-orange-50 text-orange-700 border-orange-200",
  work_started:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed:             "bg-green-50 text-green-700 border-green-200",
  closed:                "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  residential_full: "Full Home Interior",
  kitchen_wardrobe: "Kitchen & Wardrobes",
  renovation:       "Renovation",
  commercial:       "Commercial/Office",
  other:            "Other",
};

const ALL_STATUSES = Object.keys(STATUS_LABELS) as ContactStatus[];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminContactRequests() {
  const [requests, setRequests]           = useState<ContactRequest[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [updatingId, setUpdatingId]       = useState<string | null>(null);
  const [updateError, setUpdateError]     = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("contact_requests")
      .select("id, name, email, phone, project_type, message, status, notes, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("[AdminContactRequests] fetch error:", fetchError);
      setError("Could not load contact requests. Check your Supabase connection and RLS policies.");
      setLoading(false);
      return;
    }

    setRequests((data as ContactRequest[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Status update ──────────────────────────────────────────────────────────

  async function handleStatusChange(id: string, newStatus: ContactStatus) {
    setUpdatingId(id);
    setUpdateError(null);

    const { error: updateErr } = await supabase
      .from("contact_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (updateErr) {
      console.error("[AdminContactRequests] update error:", updateErr);
      setUpdateError(`Failed to update status for request. ${updateErr.message}`);
    } else {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    }

    setUpdatingId(null);
  }

  // ── Render states ──────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium text-foreground mb-2">Contact Requests</h1>
          <p className="text-muted-foreground">Incoming enquiries from the website contact form</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
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
            <p className="text-sm">Loading contact requests…</p>
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
            <h2 className="text-lg font-medium mb-1">Unable to load requests</h2>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          </div>
          <Button variant="outline" onClick={fetchRequests} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && requests.length === 0 && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center text-center min-h-[400px] p-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-medium mb-2">No requests yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Contact form submissions will appear here once visitors reach out through the website.
          </p>
        </div>
      )}

      {/* Requests table */}
      {!loading && !error && requests.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Summary bar */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {requests.length} {requests.length === 1 ? "request" : "requests"} total
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {(["new", "contacted", "site_visit_scheduled"] as ContactStatus[]).map((s) => {
                const count = requests.filter((r) => r.status === s).length;
                return count > 0 ? (
                  <span key={s} className="flex items-center gap-1">
                    <span className={`inline-block w-2 h-2 rounded-full border ${STATUS_COLORS[s]}`} />
                    {count} {STATUS_LABELS[s].toLowerCase()}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Phone</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Project Type</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Received</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {req.name}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-muted-foreground">
                      <a
                        href={`mailto:${req.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {req.email}
                      </a>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {req.phone ? (
                        <a
                          href={`tel:${req.phone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {req.phone}
                        </a>
                      ) : (
                        <span className="text-border">—</span>
                      )}
                    </td>

                    {/* Project type */}
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {req.project_type
                        ? (PROJECT_TYPE_LABELS[req.project_type] ?? req.project_type)
                        : <span className="text-border">—</span>}
                    </td>

                    {/* Current status badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Created date */}
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(req.created_at)}
                    </td>

                    {/* Status dropdown */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        {updatingId === req.id && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 rounded">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                        <Select
                          value={req.status}
                          onValueChange={(val) =>
                            handleStatusChange(req.id, val as ContactStatus)
                          }
                          disabled={updatingId === req.id}
                        >
                          <SelectTrigger className="h-8 text-xs w-44 rounded-md border-border/60">
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
