export type MediaBucket = "projects" | "products" | "team" | "brands" | "media";

export const ALL_BUCKETS: MediaBucket[] = [
  "projects", "products", "team", "brands", "media",
];

export interface MediaItem {
  id:            string;
  filename:      string;       // path within the bucket, e.g. "uuid.jpg" or "proj-id/uuid.jpg"
  original_name: string;
  url:           string;
  bucket:        MediaBucket;
  mime_type:     string | null;
  size_bytes:    number | null;
  alt_text:      string | null;
  tags:          string[];
  created_at:    string;
  updated_at:    string;
}

// Allowed MIME types → file extension label
export const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/jpg":  "JPG",
  "image/png":  "PNG",
  "image/webp": "WEBP",
  "image/avif": "AVIF",
};

export function isAllowedFile(file: File): boolean {
  return file.type in ALLOWED_MIME;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes === 0) return "—";
  if (bytes < 1024)              return `${bytes} B`;
  if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
