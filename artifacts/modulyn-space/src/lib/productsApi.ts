import { supabase } from "@/lib/supabase";
import { Product, ProductPayload } from "@/lib/productsTypes";

const TABLE = "products";

// ── Admin queries ─────────────────────────────────────────────────────────────

/** Fetch all products (any status) — for admin CMS */
export async function fetchAdminProducts(): Promise<{
  data: Product[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Product[], error: null };
}

// ── Public queries ────────────────────────────────────────────────────────────

/** Fetch active products ordered by sort_order — for public Store page */
export async function fetchPublicProducts(): Promise<{
  data: Product[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Product[], error: null };
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createProduct(payload: ProductPayload): Promise<{
  data: Product | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Product, error: null };
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductPayload>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from(TABLE).update(payload).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteProduct(id: string): Promise<{
  error: string | null;
}> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
