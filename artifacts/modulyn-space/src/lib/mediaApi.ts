import { supabase } from "@/lib/supabase";
import { MediaItem, MediaBucket } from "@/lib/mediaTypes";

const TABLE = "media_library";

// ── List / search ─────────────────────────────────────────────────────────────

export interface FetchOpts {
  search?:   string;
  bucket?:   MediaBucket | "all";
  page:      number;
  pageSize:  number;
}

export async function fetchMediaLibrary(opts: FetchOpts): Promise<{
  data: MediaItem[];
  total: number;
  error: string | null;
}> {
  const from = (opts.page - 1) * opts.pageSize;
  const to   = from + opts.pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (opts.search?.trim()) {
    query = query.ilike("original_name", `%${opts.search.trim()}%`);
  }
  if (opts.bucket && opts.bucket !== "all") {
    query = query.eq("bucket", opts.bucket);
  }

  const { data, error, count } = await query;
  if (error) return { data: [], total: 0, error: error.message };
  return { data: (data ?? []) as MediaItem[], total: count ?? 0, error: null };
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadMedia(
  file: File,
  bucket: MediaBucket,
  pathPrefix?: string
): Promise<{ data: MediaItem | null; error: string | null }> {
  const ext  = file.name.split(".").pop() ?? "jpg";
  const uuid = crypto.randomUUID();
  const path = pathPrefix ? `${pathPrefix}/${uuid}.${ext}` : `${uuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { data: null, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  const { data: row, error: insertError } = await supabase
    .from(TABLE)
    .insert({
      filename:      path,
      original_name: file.name,
      url:           publicUrl,
      bucket,
      mime_type:     file.type || null,
      size_bytes:    file.size || null,
      alt_text:      null,
      tags:          [],
    })
    .select()
    .single();

  if (insertError) return { data: null, error: insertError.message };
  return { data: row as MediaItem, error: null };
}

/**
 * Register a file that was already uploaded to storage.
 * Called by projectsApi after uploads so the file appears in the Media Library.
 * Best-effort — errors are silently ignored.
 */
export async function registerInMediaLibrary(item: {
  filename:      string;
  original_name: string;
  url:           string;
  bucket:        MediaBucket;
  mime_type:     string | null;
  size_bytes:    number | null;
}): Promise<void> {
  await supabase.from(TABLE).insert({ ...item, alt_text: null, tags: [] });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteMedia(item: MediaItem): Promise<{ error: string | null }> {
  // Remove storage object
  const { error: storageErr } = await supabase.storage
    .from(item.bucket)
    .remove([item.filename]);

  if (storageErr) console.warn("[Media] storage delete:", storageErr.message);

  // Remove metadata row
  const { error } = await supabase.from(TABLE).delete().eq("id", item.id);
  if (error) return { error: error.message };
  return { error: null };
}

// ── Update metadata ───────────────────────────────────────────────────────────

export async function updateMedia(
  id: string,
  changes: { original_name?: string; alt_text?: string | null }
): Promise<{ error: string | null }> {
  const { error } = await supabase.from(TABLE).update(changes).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
