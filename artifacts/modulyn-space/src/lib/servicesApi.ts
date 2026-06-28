import { supabase } from "@/lib/supabase";

export interface Service {
  id:                string;
  title:             string;
  slug:              string;
  description:       string | null;
  short_description: string | null;
  icon:              string | null;
  sort_order:        number;
  active:            boolean;
  created_at:        string;
  updated_at:        string;
}

export type ServicePayload = Omit<Service, "id" | "created_at" | "updated_at">;

export async function fetchAdminServices(): Promise<{ data: Service[]; error: string | null }> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Service[], error: null };
}

export async function fetchPublicServices(): Promise<{ data: Service[]; error: string | null }> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Service[], error: null };
}

export async function createService(payload: ServicePayload): Promise<{ data: Service | null; error: string | null }> {
  const { data, error } = await supabase.from("services").insert(payload).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Service, error: null };
}

export async function updateService(id: string, payload: Partial<ServicePayload>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteService(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
