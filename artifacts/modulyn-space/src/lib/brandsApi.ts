import { supabase } from "@/lib/supabase";

export interface Brand {
  id:          string;
  name:        string;
  logo_url:    string | null;
  website_url: string | null;
  sort_order:  number;
  active:      boolean;
  created_at:  string;
  updated_at:  string;
}

export type BrandPayload = Omit<Brand, "id" | "created_at" | "updated_at">;

export async function fetchAdminBrands(): Promise<{ data: Brand[]; error: string | null }> {
  const { data, error } = await supabase
    .from("material_brands")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Brand[], error: null };
}

export async function fetchPublicBrands(): Promise<{ data: Brand[]; error: string | null }> {
  const { data, error } = await supabase
    .from("material_brands")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Brand[], error: null };
}

export async function createBrand(payload: BrandPayload): Promise<{ data: Brand | null; error: string | null }> {
  const { data, error } = await supabase.from("material_brands").insert(payload).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Brand, error: null };
}

export async function updateBrand(id: string, payload: Partial<BrandPayload>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("material_brands").update(payload).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteBrand(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("material_brands").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
