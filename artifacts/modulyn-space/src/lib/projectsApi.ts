import { supabase } from "@/lib/supabase";
import {
  Project,
  ProjectImage,
  ProjectPayload,
  PUBLIC_STATUSES,
  extractStoragePath,
} from "@/lib/projectTypes";

// ── Column list ───────────────────────────────────────────────────────────────

const PROJECT_COLS = `
  id, title, slug, category, description, short_description,
  location, area_sqft, duration_months, budget_range, client_name,
  status, featured, sort_order, created_at, updated_at,
  project_images (
    id, project_id, url, alt_text,
    is_hero, is_before, is_after, sort_order, created_at
  )
`.trim();

// ── Read ──────────────────────────────────────────────────────────────────────

/** Admin: fetch all projects (any status) with their images */
export async function fetchAdminProjects(): Promise<{
  data: Project[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLS)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as Project[], error: null };
}

/** Public: only in_progress / completed, ordered by sort_order then created_at */
export async function fetchPublicProjects(): Promise<{
  data: Project[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLS)
    .in("status", PUBLIC_STATUSES)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as unknown as Project[], error: null };
}

/** Public: fetch single project by slug (only active statuses) */
export async function fetchPublicProjectBySlug(slug: string): Promise<{
  data: Project | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLS)
    .eq("slug", slug)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as Project | null, error: null };
}

/** Admin: fetch single project by id (any status) */
export async function fetchAdminProjectById(id: string): Promise<{
  data: Project | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLS)
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as Project | null, error: null };
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createProject(payload: ProjectPayload): Promise<{
  data: Project | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Project, error: null };
}

export async function updateProject(
  id: string,
  payload: Partial<ProjectPayload>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteProject(project: Project): Promise<{
  error: string | null;
}> {
  // 1. Remove storage files
  const paths = (project.project_images ?? [])
    .map((img) => extractStoragePath(img.url))
    .filter((p): p is string => p !== null);

  if (paths.length > 0) {
    await supabase.storage.from("projects").remove(paths);
    // Ignore storage errors — DB cascade will clean up metadata
  }

  // 2. Delete project row (project_images cascade via FK)
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", project.id);

  if (error) return { error: error.message };
  return { error: null };
}

// ── Images ────────────────────────────────────────────────────────────────────

export interface UploadImageFlags {
  is_hero?:   boolean;
  is_before?: boolean;
  is_after?:  boolean;
}

export async function uploadProjectImage(
  projectId: string,
  file: File,
  flags: UploadImageFlags
): Promise<{ data: ProjectImage | null; error: string | null }> {
  // Unique path within the bucket
  const ext  = file.name.split(".").pop() ?? "jpg";
  const name = `${crypto.randomUUID()}.${ext}`;
  const path = `${projectId}/${name}`;

  const { error: uploadError } = await supabase.storage
    .from("projects")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { data: null, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("projects").getPublicUrl(path);

  // Compute next sort_order for gallery images
  let sortOrder = 0;
  const isGallery = !flags.is_hero && !flags.is_before && !flags.is_after;
  if (isGallery) {
    const { data: existing } = await supabase
      .from("project_images")
      .select("sort_order")
      .eq("project_id", projectId)
      .eq("is_hero", false)
      .eq("is_before", false)
      .eq("is_after", false)
      .order("sort_order", { ascending: false })
      .limit(1);
    sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;
  }

  const { data: imgRow, error: insertError } = await supabase
    .from("project_images")
    .insert({
      project_id: projectId,
      url:        publicUrl,
      alt_text:   null,
      is_hero:    flags.is_hero   ?? false,
      is_before:  flags.is_before ?? false,
      is_after:   flags.is_after  ?? false,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (insertError) return { data: null, error: insertError.message };
  return { data: imgRow as ProjectImage, error: null };
}

export async function deleteProjectImage(image: ProjectImage): Promise<{
  error: string | null;
}> {
  const path = extractStoragePath(image.url);
  if (path) {
    await supabase.storage.from("projects").remove([path]);
  }

  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", image.id);

  if (error) return { error: error.message };
  return { error: null };
}

/** Batch-update sort_order for gallery image reordering */
export async function updateImageOrder(images: ProjectImage[]): Promise<{
  error: string | null;
}> {
  const updates = images.map((img, i) =>
    supabase
      .from("project_images")
      .update({ sort_order: i })
      .eq("id", img.id)
  );

  const results = await Promise.all(updates);
  const failed  = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };
  return { error: null };
}
