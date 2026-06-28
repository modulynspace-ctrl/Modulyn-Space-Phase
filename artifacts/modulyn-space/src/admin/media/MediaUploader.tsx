import React, { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MediaItem, MediaBucket, ALL_BUCKETS, isAllowedFile, formatFileSize } from "@/lib/mediaTypes";
import { uploadMedia } from "@/lib/mediaApi";

interface UploadResult {
  file:  File;
  item:  MediaItem | null;
  error: string | null;
}

interface Props {
  defaultBucket?: MediaBucket;
  onUploaded:    (item: MediaItem) => void;
  onClose?:      () => void;
}

export default function MediaUploader({ defaultBucket = "media", onUploaded, onClose }: Props) {
  const inputRef    = useRef<HTMLInputElement>(null);
  const [bucket,    setBucket]    = useState<MediaBucket>(defaultBucket);
  const [dragOver,  setDragOver]  = useState(false);
  const [queue,     setQueue]     = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);

  function accept() {
    return "image/jpeg,image/png,image/webp,image/avif";
  }

  function addToQueue(files: File[]) {
    const valid   = files.filter(isAllowedFile);
    const invalid = files.filter((f) => !isAllowedFile(f));

    const entries: UploadResult[] = [
      ...valid.map((f) => ({ file: f, item: null, error: null })),
      ...invalid.map((f) => ({
        file:  f,
        item:  null,
        error: `Unsupported file type: ${f.type || f.name.split(".").pop()}`,
      })),
    ];

    setQueue((prev) => [...prev, ...entries]);
    if (valid.length) processQueue(valid);
  }

  async function processQueue(files: File[]) {
    setUploading(true);
    for (const file of files) {
      const { data, error } = await uploadMedia(file, bucket);
      setQueue((prev) =>
        prev.map((q) =>
          q.file === file ? { ...q, item: data, error } : q
        )
      );
      if (data) onUploaded(data);
    }
    setUploading(false);
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addToQueue(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) addToQueue(files);
  }

  const doneCount    = queue.filter((q) => q.item).length;
  const errorCount   = queue.filter((q) => q.error).length;
  const pendingCount = queue.filter((q) => !q.item && !q.error).length;

  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Upload to bucket:</span>
          <Select value={bucket} onValueChange={(v) => setBucket(v as MediaBucket)}>
            <SelectTrigger className="w-32 h-8 text-sm border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_BUCKETS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg py-12 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse — JPG, PNG, WEBP, AVIF accepted</p>
        </div>
        {uploading && (
          <div className="flex items-center gap-2 text-primary text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading {pendingCount} file{pendingCount !== 1 ? "s" : ""}…
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept()}
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {/* Results list */}
      {queue.length > 0 && (
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {queue.map((q, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {q.item ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : q.error ? (
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              )}
              <span className={`flex-1 truncate ${q.error ? "text-destructive" : "text-foreground"}`}>
                {q.file.name}
              </span>
              <span className="text-muted-foreground text-xs shrink-0">
                {formatFileSize(q.file.size)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {queue.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/50">
          {doneCount > 0  && <span className="text-emerald-600">{doneCount} uploaded</span>}
          {errorCount > 0 && <span className="text-destructive">{errorCount} failed</span>}
          {pendingCount > 0 && <span>{pendingCount} pending…</span>}
          <Button
            variant="ghost" size="sm" className="h-6 px-2 text-xs ml-auto"
            onClick={() => setQueue([])}
            disabled={uploading}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
