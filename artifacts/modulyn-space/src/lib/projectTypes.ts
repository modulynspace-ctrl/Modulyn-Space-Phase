// ── Enums ─────────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | "draft"
  | "planning"
  | "in_progress"
  | "completed"
  | "archived";

export type ProjectCategory =
  | "home_interior"
  | "modular_kitchen"
  | "wardrobe"
  | "turnkey"
  | "renovation"
  | "commercial"
  | "furniture"
  | "false_ceiling"
  | "electrical"
  | "landscape";

// ── Label maps ────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  home_interior:  "Home Interior",
  modular_kitchen:"Modular Kitchen",
  wardrobe:       "Wardrobe",
  turnkey:        "Turnkey",
  renovation:     "Renovation",
  commercial:     "Commercial",
  furniture:      "Furniture",
  false_ceiling:  "False Ceiling",
  electrical:     "Electrical",
  landscape:      "Landscape",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft:       "Draft",
  planning:    "Planning",
  in_progress: "In Progress",
  completed:   "Completed",
  archived:    "Archived",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  draft:       "bg-zinc-100 text-zinc-500 border-zinc-200",
  planning:    "bg-blue-50 text-blue-600 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  completed:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived:    "bg-slate-100 text-slate-500 border-slate-200",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
export const ALL_STATUSES   = Object.keys(STATUS_LABELS)   as ProjectStatus[];

/** Statuses visible on the public website */
export const PUBLIC_STATUSES: ProjectStatus[] = ["in_progress", "completed"];

// ── Data shapes ───────────────────────────────────────────────────────────────

export interface ProjectImage {
  id:         string;
  project_id: string;
  url:        string;
  alt_text:   string | null;
  is_hero:    boolean;
  is_before:  boolean;
  is_after:   boolean;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id:                string;
  title:             string;
  slug:              string;
  category:          ProjectCategory;
  description:       string | null;
  short_description: string | null;
  location:          string | null;
  area_sqft:         number | null;
  duration_months:   number | null;
  budget_range:      string | null;
  client_name:       string | null;
  status:            ProjectStatus;
  featured:          boolean;
  sort_order:        number;
  created_at:        string;
  updated_at:        string;
  project_images?:   ProjectImage[];
}

// Omit generated fields for create/update payloads
export type ProjectPayload = Omit<Project, "id" | "created_at" | "updated_at" | "project_images">;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function heroImage(project: Project): ProjectImage | undefined {
  return project.project_images?.find((i) => i.is_hero);
}

export function beforeImage(project: Project): ProjectImage | undefined {
  return project.project_images?.find((i) => i.is_before);
}

export function afterImage(project: Project): ProjectImage | undefined {
  return project.project_images?.find((i) => i.is_after);
}

export function galleryImages(project: Project): ProjectImage[] {
  return (project.project_images ?? [])
    .filter((i) => !i.is_hero && !i.is_before && !i.is_after)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Extract storage path from a Supabase public URL */
export function extractStoragePath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/projects\/(.+)$/);
  return match ? match[1] : null;
}
