import { KickstartProject, BootstrapResult } from "../types";
import { createGitHubRepo } from "./github";
import { createSupabaseProject } from "./supabase";
import { createVercelProject } from "./vercel";
import { updateProjectBootstrap } from "../queries";

export type BootstrapStep = (msg: string) => void;

export async function bootstrapProject(
  project: KickstartProject,
  onStep: BootstrapStep
): Promise<BootstrapResult> {
  const result: BootstrapResult = { errors: [] };

  if (!project.project_md) {
    result.errors.push("PROJECT.md mangler — generer spec først");
    return result;
  }

  // GitHub
  try {
    onStep("Oppretter GitHub-repo...");
    result.github_repo_url = await createGitHubRepo(
      project.project_name,
      project.short_description ?? "",
      project.project_md
    );
    onStep(`GitHub-repo opprettet: ${result.github_repo_url}`);
  } catch (e) {
    result.errors.push(`GitHub: ${(e as Error).message}`);
  }

  // Supabase
  try {
    onStep("Oppretter Supabase-prosjekt...");
    result.supabase_project_ref = await createSupabaseProject(project.project_name);
    onStep(`Supabase-prosjekt opprettet: ${result.supabase_project_ref}`);
  } catch (e) {
    result.errors.push(`Supabase: ${(e as Error).message}`);
  }

  // Vercel
  try {
    onStep("Oppretter Vercel-prosjekt...");
    result.vercel_project_id = await createVercelProject(
      project.project_name,
      result.github_repo_url
    );
    onStep(`Vercel-prosjekt opprettet: ${result.vercel_project_id}`);
  } catch (e) {
    result.errors.push(`Vercel: ${(e as Error).message}`);
  }

  // Persist
  try {
    await updateProjectBootstrap(project.id, {
      github_repo_url: result.github_repo_url,
      supabase_project_ref: result.supabase_project_ref,
      vercel_project_id: result.vercel_project_id,
    });
  } catch (e) {
    result.errors.push(`DB-oppdatering: ${(e as Error).message}`);
  }

  return result;
}
