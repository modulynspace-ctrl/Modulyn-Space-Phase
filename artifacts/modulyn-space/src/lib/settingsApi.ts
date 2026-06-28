import { supabase } from "@/lib/supabase";

// ── Homepage Settings (singleton row) ─────────────────────────────────────────

export interface HomepageSettings {
  id:                   string;
  hero_headline:        string | null;
  hero_subheading:      string | null;
  hero_image_url:       string | null;
  featured_project_id:  string | null;
  stats_projects_count: number;
  stats_clients_count:  number;
  stats_years:          number;
  updated_at:           string;
}

export type HomepageSettingsPayload = Omit<HomepageSettings, "id" | "updated_at">;

export async function fetchHomepageSettings(): Promise<{ data: HomepageSettings | null; error: string | null }> {
  const { data, error } = await supabase.from("homepage_settings").select("*").maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data: data as HomepageSettings | null, error: null };
}

export async function updateHomepageSettings(payload: Partial<HomepageSettingsPayload>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("homepage_settings").update(payload).eq("singleton", true);
  if (error) return { error: error.message };
  return { error: null };
}

// ── Website Settings (key-value store) ────────────────────────────────────────

export type WebsiteSettings = Partial<Record<WebsiteSettingKey, string | null>>;

export const WS_KEYS = [
  "site_name",
  "site_email",
  "site_phone",
  "site_address",
  "whatsapp_number",
  "instagram_url",
  "facebook_url",
  "linkedin_url",
  "youtube_url",
  "google_maps_url",
  "copyright_text",
  "footer_text",
] as const;

export type WebsiteSettingKey = (typeof WS_KEYS)[number];

export async function fetchWebsiteSettings(): Promise<{ data: WebsiteSettings; error: string | null }> {
  const { data, error } = await supabase.from("website_settings").select("key, value");
  if (error) return { data: {}, error: error.message };
  const settings: WebsiteSettings = {};
  for (const row of data ?? []) {
    if (WS_KEYS.includes(row.key as WebsiteSettingKey)) {
      settings[row.key as WebsiteSettingKey] = row.value;
    }
  }
  return { data: settings, error: null };
}

export async function updateWebsiteSettings(updates: WebsiteSettings): Promise<{ error: string | null }> {
  const rows = Object.entries(updates).map(([key, value]) => ({ key, value: value ?? null }));
  if (rows.length === 0) return { error: null };
  const { error } = await supabase.from("website_settings").upsert(rows, { onConflict: "key" });
  if (error) return { error: error.message };
  return { error: null };
}
