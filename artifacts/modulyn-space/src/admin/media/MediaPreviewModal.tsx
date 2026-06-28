import React, { useEffect, useState } from "react";
import {
  Copy, Trash2, Loader2, CheckCircle2, AlertCircle, ExternalLink, Pencil, X,
} from "lucide-react";
import {
  Dialog, DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaItem, formatFileSize, formatDate } from "@/lib/mediaTypes";
import { deleteMedia, updateMedia } from "@/lib/mediaApi";

interface Props {
  item:      MediaItem | null;
  onClose:   () => void;
  onDeleted: (id: string) => void;
  onUpdated: (item: MediaItem) => void;
}

export default function MediaPreviewModal({ item, onClose, onDeleted, onUpdated }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [editingAlt,  setEditingAlt]  = useState(false);
  const [nameValue,   setNameValue]   = useState("");
  const [altValue,    setAltValue]    = useState("");
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setNameValue(item.original_name);
      setAltValue(item.alt_text ?? "");
      setEditingName(false);
      setEditingAlt(false);
      setError(null);
    }
  }, [item]);

  if (!item) return null;

  async function handleSaveName() {
    if (!item || !nameValue.trim()) return;
    setSaving(true);
    const { error: err } = await updateMedia(item.id, { original_name: nameValue.trim() });
    setSaving(false);
    if (err) { setError(err); return; }
    setEditingName(false);
    onUpdated({ ...item, original_name: nameValue.trim() });
  }

  async function handleSaveAlt() {
    if (!item) return;
    setSaving(true);
    const { error: err } = await updateMedia(item.id, { alt_text: altValue.trim() || null });
    setSaving(false);
    if (err) { setError(err); return; }
    setEditingAlt(false);
    onUpdated({ ...item, alt_text: altValue.trim() || null });
  }

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);
    const { error: err } = await deleteMedia(item);
    setDeleting(false);
    if (err) { setError(err); return; }
    onDeleted(item.id);
    onClose();
  }

  function handleCopy() {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const ext = item.original_name.split(".").pop()?.toUpperCase() ?? "IMG";

  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden gap-0">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] h-auto md:h-[80vh]">

          {/* ── Image Panel ── */}
          <div className="bg-zinc-900 flex items-center justify-center p-4 min-h-64 md:min-h-0">
            <img
              src={item.url}
              alt={item.alt_text ?? item.original_name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* ── Details Panel ── */}
          <div className="flex flex-col overflow-y-auto bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {ext} · {item.bucket}
              </span>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 space-y-5">
              {error && (
                <div className="flex items-start gap-2 text-destructive text-xs bg-destructive/10 px-3 py-2 rounded">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              {/* File name */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                  File Name
                </label>
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="h-8 text-sm border-border/60"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                    />
                    <Button size="sm" className="h-8 px-3 shrink-0" onClick={handleSaveName} disabled={saving}>
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-medium break-all flex-1">{item.original_name}</p>
                    <button
                      onClick={() => setEditingName(true)}
                      className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5"
                      title="Rename"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Alt text */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Alt Text
                </label>
                {editingAlt ? (
                  <div className="space-y-2">
                    <Textarea
                      value={altValue}
                      onChange={(e) => setAltValue(e.target.value)}
                      className="text-sm border-border/60 resize-none h-20"
                      placeholder="Describe the image…"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 px-3 text-xs" onClick={handleSaveAlt} disabled={saving}>
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-3 text-xs" onClick={() => setEditingAlt(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className={`text-sm flex-1 ${item.alt_text ? "text-foreground" : "text-muted-foreground italic"}`}>
                      {item.alt_text ?? "No alt text set"}
                    </p>
                    <button
                      onClick={() => setEditingAlt(true)}
                      className="shrink-0 text-muted-foreground hover:text-foreground mt-0.5"
                      title="Edit alt text"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-3 pt-1 border-t border-border/50">
                {[
                  { label: "Bucket",    value: item.bucket },
                  { label: "Type",      value: item.mime_type ?? "—" },
                  { label: "Size",      value: formatFileSize(item.size_bytes) },
                  { label: "Uploaded",  value: formatDate(item.created_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs text-foreground font-medium text-right break-all">{value}</span>
                  </div>
                ))}
              </div>

              {/* Storage path */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Storage Path
                </label>
                <p className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1.5 rounded break-all">
                  {item.bucket}/{item.filename}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-border/50 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 justify-center text-xs"
                onClick={handleCopy}
              >
                {copied
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy Public URL</>}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 justify-center text-xs"
                onClick={() => window.open(item.url, "_blank")}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </Button>
              <Button
                size="sm"
                className="w-full gap-2 justify-center text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                  : <><Trash2 className="w-3.5 h-3.5" /> Delete Permanently</>}
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
