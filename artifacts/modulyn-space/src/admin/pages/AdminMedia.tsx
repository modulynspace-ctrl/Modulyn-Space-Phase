import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Search, LayoutGrid, List, Upload, RefreshCw,
  Eye, Copy, Trash2, Loader2, AlertCircle, CheckCircle2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MediaItem, MediaBucket, ALL_BUCKETS, formatFileSize, formatDate,
} from "@/lib/mediaTypes";
import { fetchMediaLibrary, deleteMedia } from "@/lib/mediaApi";
import MediaUploader from "@/admin/media/MediaUploader";
import MediaPreviewModal from "@/admin/media/MediaPreviewModal";

const PAGE_SIZE = 24;

export default function AdminMedia() {
  const [items,    setItems]    = useState<MediaItem[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [search,   setSearch]   = useState("");
  const [bucket,   setBucket]   = useState<MediaBucket | "all">("all");
  const [page,     setPage]     = useState(1);
  const [view,     setView]     = useState<"grid" | "list">("grid");
  const [preview,  setPreview]  = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState<string | null>(null);
  const [copiedId,     setCopiedId]     = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Debounce search ────────────────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, total: t, error: err } = await fetchMediaLibrary({
      search: debouncedSearch, bucket, page, pageSize: PAGE_SIZE,
    });
    setLoading(false);
    if (err) { setError(err); return; }
    setItems(data);
    setTotal(t);
  }, [debouncedSearch, bucket, page]);

  useEffect(() => { load(); }, [load]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleUploaded(item: MediaItem) {
    setItems((prev) => [item, ...prev]);
    setTotal((prev) => prev + 1);
  }

  function handleUpdated(updated: MediaItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    if (preview?.id === updated.id) setPreview(updated);
  }

  function handleDeletedFromModal(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setTotal((prev) => Math.max(0, prev - 1));
    setPreview(null);
  }

  function handleCopy(item: MediaItem, e?: React.MouseEvent) {
    e?.stopPropagation();
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { error: err } = await deleteMedia(deleteTarget);
    setDeleting(false);
    if (err) { setDeleteError(err); return; }
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    setTotal((prev) => Math.max(0, prev - 1));
    setDeleteTarget(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-medium mb-1">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            {total > 0 ? `${total.toLocaleString()} file${total !== 1 ? "s" : ""}` : "Upload and organise project assets"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowUpload((v) => !v)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {showUpload ? <><X className="w-4 h-4" /> Hide Uploader</> : <><Upload className="w-4 h-4" /> Upload</>}
          </Button>
        </div>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <MediaUploader
          defaultBucket="media"
          onUploaded={handleUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Filter toolbar */}
      <div className="bg-white border border-border rounded-xl px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by file name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 border-border/60"
          />
        </div>
        <Select value={bucket} onValueChange={(v) => { setBucket(v as typeof bucket); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm border-border/60">
            <SelectValue placeholder="All buckets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buckets</SelectItem>
            {ALL_BUCKETS.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {total > 0 && <span className="text-xs text-muted-foreground ml-auto">{total} file{total !== 1 ? "s" : ""}</span>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center min-h-48 gap-4 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium mb-1">Could not load media</p>
            <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Try again
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="bg-white border border-border rounded-xl flex flex-col items-center justify-center min-h-64 gap-4 p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {debouncedSearch || bucket !== "all"
              ? "No files match the current filters."
              : "No files uploaded yet. Click Upload to get started."}
          </p>
          {!debouncedSearch && bucket === "all" && (
            <Button size="sm" onClick={() => setShowUpload(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="w-4 h-4" /> Upload Files
            </Button>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {!loading && !error && items.length > 0 && view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
              onClick={() => setPreview(item)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <img
                  src={item.url}
                  alt={item.alt_text ?? item.original_name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreview(item); }}
                    className="p-1.5 rounded bg-white/20 hover:bg-white/30 text-white"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleCopy(item, e)}
                    className="p-1.5 rounded bg-white/20 hover:bg-white/30 text-white"
                    title="Copy URL"
                  >
                    {copiedId === item.id
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); setDeleteError(null); }}
                    className="p-1.5 rounded bg-white/20 hover:bg-destructive/70 text-white"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {/* Info strip */}
              <div className="px-2.5 py-2">
                <p className="text-xs font-medium truncate text-foreground">{item.original_name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatFileSize(item.size_bytes)} · <span className="font-medium">{item.bucket}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── List view ── */}
      {!loading && !error && items.length > 0 && view === "list" && (
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-14">Image</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bucket</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Size</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Uploaded</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div
                        className="w-10 h-10 rounded overflow-hidden bg-secondary border border-border cursor-pointer shrink-0"
                        onClick={() => setPreview(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.original_name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-xs">{item.original_name}</p>
                      {item.alt_text && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{item.alt_text}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary border border-border text-muted-foreground uppercase tracking-wide">
                        {item.bucket}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {item.mime_type?.split("/")[1]?.toUpperCase() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatFileSize(item.size_bytes)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreview(item)} title="Preview">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm" className="h-8 w-8 p-0"
                          onClick={() => handleCopy(item)}
                          title="Copy URL"
                        >
                          {copiedId === item.id
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => { setDeleteTarget(item); setDeleteError(null); }}
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && arr[i - 1] !== n - 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="px-1">…</span>
                ) : (
                  <Button
                    key={n}
                    variant={page === n ? "default" : "outline"}
                    size="sm"
                    className={`h-7 w-7 p-0 text-xs ${page === n ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setPage(n as number)}
                  >
                    {n}
                  </Button>
                )
              )}
            <Button variant="outline" size="sm" className="h-7 px-3 text-xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      <MediaPreviewModal
        item={preview}
        onClose={() => setPreview(null)}
        onDeleted={handleDeletedFromModal}
        onUpdated={handleUpdated}
      />

      {/* Delete confirm (from grid/list quick actions) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.original_name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the file from storage and removes it from the Media Library. This cannot be undone.
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
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-2 inline" />Deleting…</> : "Delete File"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
