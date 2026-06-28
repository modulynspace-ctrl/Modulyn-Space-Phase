import React, { useCallback, useEffect, useRef, useState } from "react";
import { Search, Upload, Loader2, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MediaItem, MediaBucket, ALL_BUCKETS, isAllowedFile, formatFileSize } from "@/lib/mediaTypes";
import { fetchMediaLibrary, uploadMedia } from "@/lib/mediaApi";

const PAGE_SIZE = 24;

interface Props {
  open:           boolean;
  onClose:        () => void;
  onSelect:       (item: MediaItem) => void;
  defaultBucket?: MediaBucket | "all";
  title?:         string;
}

export default function MediaPickerModal({
  open, onClose, onSelect, defaultBucket = "all", title = "Choose from Media Library",
}: Props) {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [items,       setItems]       = useState<MediaItem[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [bucket,      setBucket]      = useState<MediaBucket | "all">(defaultBucket);
  const [page,        setPage]        = useState(1);
  const [selected,    setSelected]    = useState<MediaItem | null>(null);
  const [uploadBucket, setUploadBucket] = useState<MediaBucket>("projects");
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError(null);
    const { data, total: t, error: err } = await fetchMediaLibrary({
      search, bucket, page, pageSize: PAGE_SIZE,
    });
    setLoading(false);
    if (err) { setError(err); return; }
    setItems(data);
    setTotal(t);
  }, [open, search, bucket, page]);

  useEffect(() => {
    if (open) {
      setSelected(null);
      setSearch("");
      setBucket(defaultBucket);
      setPage(1);
      setUploadError(null);
    }
  }, [open, defaultBucket]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadInputRef.current) uploadInputRef.current.value = "";

    if (!isAllowedFile(file)) {
      setUploadError("Unsupported file type. Use JPG, PNG, WEBP, or AVIF.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    const { data, error: err } = await uploadMedia(file, uploadBucket);
    setUploading(false);
    if (err) { setUploadError(err); return; }
    if (data) {
      setSelected(data);
      setPage(1);
      setBucket(uploadBucket);
      load();
    }
  }

  function handleConfirm() {
    if (!selected) return;
    onSelect(selected);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
        </DialogHeader>

        {/* ── Toolbar ── */}
        <div className="px-6 py-3 border-b border-border/50 shrink-0 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search images…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm border-border/60"
            />
          </div>

          {/* Bucket filter */}
          <Select value={bucket} onValueChange={(v) => { setBucket(v as typeof bucket); setPage(1); }}>
            <SelectTrigger className="w-32 h-8 text-sm border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buckets</SelectItem>
              {ALL_BUCKETS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={load} title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <div className="border-l border-border/50 pl-3 flex items-center gap-2">
            {/* Upload bucket selector */}
            <Select value={uploadBucket} onValueChange={(v) => setUploadBucket(v as MediaBucket)}>
              <SelectTrigger className="w-28 h-8 text-xs border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_BUCKETS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading…</>
                : <><Upload className="w-3 h-3" /> Upload New</>}
            </Button>
          </div>

          <input
            ref={uploadInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="px-6 py-2 shrink-0 flex items-center gap-2 text-destructive text-sm bg-destructive/10 border-b border-destructive/20">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
          </div>
        )}

        {/* ── Grid ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={load}>Try again</Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
              <p className="text-sm">No images found.</p>
              <p className="text-xs">Upload one using the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {items.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-primary/40"
                    }`}
                    title={item.original_name}
                  >
                    <img
                      src={item.url}
                      alt={item.alt_text ?? item.original_name}
                      loading="lazy"
                      className="w-full h-full object-cover bg-secondary"
                    />
                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-primary drop-shadow" />
                      </div>
                    )}
                    {/* Name tooltip strip */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1 opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] truncate">{item.original_name}</p>
                      <p className="text-white/60 text-[9px]">{formatFileSize(item.size_bytes)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-border/50 shrink-0 flex items-center justify-between gap-4">
          {/* Pagination */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {total > 0 && <span>{total} image{total !== 1 ? "s" : ""}</span>}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="outline" size="sm" className="h-7 px-2 text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <span className="text-xs px-1">{page} / {totalPages}</span>
                <Button
                  variant="outline" size="sm" className="h-7 px-2 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selected && (
              <p className="text-xs text-muted-foreground max-w-48 truncate">
                Selected: <span className="text-foreground font-medium">{selected.original_name}</span>
              </p>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button
              size="sm"
              disabled={!selected}
              onClick={handleConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Use This Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
