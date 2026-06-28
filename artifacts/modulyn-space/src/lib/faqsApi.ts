import { supabase } from "@/lib/supabase";

export interface FAQ {
  id:         string;
  question:   string;
  answer:     string;
  category:   string | null;
  sort_order: number;
  active:     boolean;
  created_at: string;
  updated_at: string;
}

export type FAQPayload = Omit<FAQ, "id" | "created_at" | "updated_at">;

export async function fetchAdminFAQs(): Promise<{ data: FAQ[]; error: string | null }> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as FAQ[], error: null };
}

export async function fetchPublicFAQs(): Promise<{ data: FAQ[]; error: string | null }> {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as FAQ[], error: null };
}

export async function createFAQ(payload: FAQPayload): Promise<{ data: FAQ | null; error: string | null }> {
  const { data, error } = await supabase.from("faqs").insert(payload).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as FAQ, error: null };
}

export async function updateFAQ(id: string, payload: Partial<FAQPayload>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("faqs").update(payload).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteFAQ(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
