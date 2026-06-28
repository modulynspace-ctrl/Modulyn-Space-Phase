import { supabase } from "@/lib/supabase";

export interface TeamMember {
  id:         string;
  name:       string;
  role:       string;
  bio:        string | null;
  image_url:  string | null;
  sort_order: number;
  active:     boolean;
  created_at: string;
  updated_at: string;
}

export type TeamMemberPayload = Omit<TeamMember, "id" | "created_at" | "updated_at">;

export async function fetchAdminTeamMembers(): Promise<{ data: TeamMember[]; error: string | null }> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as TeamMember[], error: null };
}

export async function fetchPublicTeamMembers(): Promise<{ data: TeamMember[]; error: string | null }> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as TeamMember[], error: null };
}

export async function createTeamMember(payload: TeamMemberPayload): Promise<{ data: TeamMember | null; error: string | null }> {
  const { data, error } = await supabase.from("team_members").insert(payload).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as TeamMember, error: null };
}

export async function updateTeamMember(id: string, payload: Partial<TeamMemberPayload>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("team_members").update(payload).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteTeamMember(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}
