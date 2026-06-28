import { supabase } from "@/lib/supabase";

export interface Testimonial {
  id:              string;
  client_name:     string;
  client_location: string | null;
  project_id:      string | null;
  rating:          number;
  content:         string;
  avatar_url:      string | null;
  featured:        boolean;
  sort_order:      number;
  active:          boolean;
  created_at:      string;
  updated_at:      string;
}

export type TestimonialPayload = Omit<Testimonial, "id" | "created_at" | "updated_at">;

export async function fetchAdminTestimonials(): Promise<{ data: Testimonial[]; error: string | null }> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Testimonial[], error: null };
}

export async function fetchPublicTestimonials(): Promise<{ data: Testimonial[]; error: string | null }> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as Testimonial[], error: null };
}

export async function createTestimonial(payload: TestimonialPayload): Promise<{ data: Testimonial | null; error: string | null }> {
  const { data, error } = await supabase.from("testimonials").insert(payload).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Testimonial, error: null };
}

export async function updateTestimonial(id: string, payload: Partial<TestimonialPayload>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("testimonials").update(payload).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteTestimonial(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
