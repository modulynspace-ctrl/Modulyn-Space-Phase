import React, { useMemo, useState } from "react";
import {
  Search, Plus, RefreshCw, Pencil, Trash2,
  Star, AlertCircle, Loader2, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Project, ProjectCategory, ProjectStatus,
  CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS,
  ALL_CATEGORIES, ALL_STATUSES, heroImage,
} from "@/lib/projectTypes";
import { deleteProject } from "@/lib/projectsApi";

const PAGE_SIZE = 10;

interface Props {
  projects: Project[];
  loading:  boolean;
  error:    string | null;
  onAdd:    () => void;
  onEdit:   (p: Project) => void;
  onRefresh: () => void;
  onDeleted: (id: string) => void;
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function ProjectList({
  projects, loading, error, onAdd, onEdit, onRefresh, onDeleted,
}: Props) {
  const [search,   setSearch]   = useState("");
  const [catFilter,  setCatFilter]  = useState<"all" | ProjectCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [sort,     setSort]     = useState<"newest" | "oldest">("newest");
  const [page,     setPage]     = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState<string | null>(null);

  // ── Filtered + sorted list ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.location ?? "").toLowerCase().includes(q) ||
          (p.client_name ?? "").toLowerCase().includes(q)
      );
    }
    if (catFilter !== "all") list = list.filter((p) => p.category === catFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    list.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [projects, search, catFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { error: err } = await deleteProject(deleteTarget);
    setDeleting(false);
    if (err) { setDeleteError(err); return; }
    onDeleted(deleteTarget.id);
    setDeleteTarget(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium mb-1">Projects</h1>
          <p className="text-muted-foreground text-sm">Manage your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border rounded-xl px-5 py-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, location, client…"
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
            className="pl-9 h-9 border-border/60"
          />
        </div>
        <Select value={catFilter} onValueChange={(v) => handleFilterChange(() => setCatFilter(v as typeof catFilter))}>
          <SelectTrigger className="w-44 h-9 text-sm border-border/60">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ALL_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => handleFilterChange(() => setStatusFilter(v as typeof statusFilter))}>
          <SelectTrigger className="w-40 h-9 text-sm border-border/60">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "oldest")}>
          <SelectTrigger className="w-36 h-9 text-sm border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        {filtered.length !== projects.length && (
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {projects.length} projects
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-border rounded-xl flex items-center justify-center min-h-64">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center text-center min-h-64 gap-4 p-8">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <p className="font-medium mb-1">Could not load projects</p>
            <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
          </div>
          <Button variant="outline" onClick={onRefresh} size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Try again
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center text-center min-h-64 gap-4 p-8">
          <p className="text-muted-foreground text-sm">No projects yet. Add your first project to get started.</p>
          <Button size="sm" onClick={onAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        </div>
      )}

      {/* No filter results */}
      {!loading && !error && projects.length > 0 && paged.length === 0 && (
        <div className="bg-white border border-border rounded-xl flex items-center justify-center min-h-32 p-8">
          <p className="text-muted-foreground text-sm">No projects match the current filters.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && paged.length > 0 && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">Image</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Project</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">
                    <Star className="w-3.5 h-3.5 inline" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" />Created</span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((p) => {
                  const hero = heroImage(p);
                  return (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 rounded overflow-hidden bg-secondary border border-border shrink-0">
                          {hero ? (
                            <img
                              src={hero.url}
                              alt={p.title}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-[10px] font-medium uppercase">
                              No img
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title + slug */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.slug}</p>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {CATEGORY_LABELS[p.category]}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.location ?? <span className="text-border">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3 text-center">
                        {p.featured && <Star className="w-4 h-4 text-primary inline fill-primary" />}
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit(p)}
                            title="Edit project"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { setDeleteTarget(p); setDeleteError(null); }}
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-5 py-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm" className="h-7 px-3 text-xs"
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, n, i, arr) => {
                    if (i > 0 && arr[i - 1] !== n - 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-1">…</span>
                    ) : (
                      <Button
                        key={n}
                        variant={safePage === n ? "default" : "outline"}
                        size="sm"
                        className={`h-7 w-7 p-0 text-xs ${safePage === n ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => setPage(n as number)}
                      >
                        {n}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline" size="sm" className="h-7 px-3 text-xs"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project, all its images, and the associated files from storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-2 inline" />Deleting…</> : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
