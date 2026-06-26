import { supabaseAdmin } from "@/lib/supabase";
import { KickstartProject, WizardFormData } from "./types";

export async function listProjects(): Promise<KickstartProject[]> {
  const { data, error } = await supabaseAdmin()
    .from("kickstart_projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as KickstartProject[];
}

export async function getProject(id: string): Promise<KickstartProject | null> {
  const { data, error } = await supabaseAdmin()
    .from("kickstart_projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as KickstartProject;
}

export async function createProject(form: WizardFormData): Promise<KickstartProject> {
  const { data, error } = await supabaseAdmin()
    .from("kickstart_projects")
    .insert({
      client_name: form.client_name,
      project_name: form.project_name,
      project_type: form.project_type,
      tech_stack: form.tech_stack,
      primary_color: form.primary_color || null,
      short_description: form.short_description,
      long_description: form.long_description,
      status: "draft",
      step_completed: 6,
    })
    .select()
    .single();
  if (error) throw error;
  return data as KickstartProject;
}

export async function updateProjectMd(id: string, project_md: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("kickstart_projects")
    .update({ project_md, status: "generated" })
    .eq("id", id);
  if (error) throw error;
}

export async function updateProjectEstimate(id: string, price_estimate: object): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("kickstart_projects")
    .update({ price_estimate })
    .eq("id", id);
  if (error) throw error;
}

export async function updateProjectBootstrap(
  id: string,
  data: { github_repo_url?: string; supabase_project_ref?: string; vercel_project_id?: string }
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("kickstart_projects")
    .update({ ...data, status: "bootstrapped" })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("kickstart_projects")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
