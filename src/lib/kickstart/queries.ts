import { supabaseAdmin } from "@/lib/supabase";
import { KickstartProject, WizardFormData } from "./types";

/**
 * Kolonnene listevisningen faktisk trenger. `select("*")` dro med seg både
 * project_md (100 000+ tegn) og mockup_images (base64-bilder) for hvert eneste
 * prosjekt — det ble fort megabytes for en side som viser navn og status.
 */
const LIST_COLUMNS =
  "id, created_at, updated_at, client_name, project_name, project_type, status, " +
  "short_description, primary_color, design_direction, generated_parts, github_repo_url";

export type ProjectListItem = Pick<
  KickstartProject,
  | "id"
  | "created_at"
  | "updated_at"
  | "client_name"
  | "project_name"
  | "project_type"
  | "status"
  | "short_description"
  | "primary_color"
  | "design_direction"
  | "generated_parts"
  | "github_repo_url"
>;

export async function listProjects(): Promise<ProjectListItem[]> {
  const { data, error } = await supabaseAdmin()
    .from("kickstart_projects")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) {
    // generated_parts finnes ikke før migrasjonen er kjørt — ikke la hele
    // listen dø av det.
    if (isMissingColumn(error, "generated_parts")) {
      const { data: fallback, error: fallbackError } = await supabaseAdmin()
        .from("kickstart_projects")
        .select(LIST_COLUMNS.replace(", generated_parts", ""))
        .order("created_at", { ascending: false });
      if (fallbackError) throw fallbackError;
      return (fallback ?? []) as unknown as ProjectListItem[];
    }
    throw error;
  }
  return (data ?? []) as unknown as ProjectListItem[];
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
      client_name:       form.client_name,
      project_name:      form.project_name,
      contact_person:    form.contact_person || null,
      new_domain:        form.new_domain || null,
      existing_url:      form.existing_url || null,
      project_type:      form.project_type,
      auth_type:         form.auth_type || "supabase-auth",
      sprint_estimate:   form.sprint_estimate ?? 6,
      requires_scrape:   form.requires_scrape ?? false,
      tech_stack:        form.tech_stack,
      integrations:      form.integrations ?? [],
      design_direction:  form.design_direction || null,
      primary_color:     form.primary_color || null,
      secondary_color:   form.secondary_color || null,
      motion_preference: form.motion_preference || "subtil",
      features:          form.features || null,
      extra_notes:       form.extra_notes || null,
      short_description: form.short_description,
      long_description:  form.long_description,
      status:            "draft",
      step_completed:    9,
    })
    .select()
    .single();
  if (error) throw error;
  return data as KickstartProject;
}

/**
 * Skriver project_md og hvor mange av de 12 delene som er ferdige. Kolonnen
 * `generated_parts` kom med migrasjonen i supabase/migrations/ — kjører man mot
 * en database der den ikke er lagt til ennå, faller vi tilbake til å lagre kun
 * teksten framfor å miste et helt generert kapittel.
 */
async function writeMd(
  id: string,
  project_md: string,
  generated_parts: number,
  extra: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("kickstart_projects")
    .update({ project_md, generated_parts, ...extra })
    .eq("id", id);
  if (!error) return;

  if (isMissingColumn(error, "generated_parts")) {
    console.warn(
      "[queries] Kolonnen generated_parts mangler — kjør supabase/migrations/ mot databasen. Lagrer uten fremdrift.",
    );
    const { error: fallbackError } = await supabaseAdmin()
      .from("kickstart_projects")
      .update({ project_md, ...extra })
      .eq("id", id);
    if (fallbackError) throw fallbackError;
    return;
  }
  throw error;
}

function isMissingColumn(error: { message?: string; code?: string }, column: string): boolean {
  const message = error.message ?? "";
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    (message.includes(column) && /column|kolonne/i.test(message))
  );
}

/** Siste del ferdig: markerer prosjektet som generert. */
export async function updateProjectMd(
  id: string,
  project_md: string,
  generated_parts: number,
): Promise<void> {
  await writeMd(id, project_md, generated_parts, { status: "generated" });
}

/**
 * Mellomlagring mellom delene. Kaster hvis skrivingen feiler: neste del leser
 * project_md fra databasen, så en tapt lagring ville gitt en spec med hull uten
 * at noen så det.
 */
export async function savePartialMd(
  id: string,
  project_md: string,
  generated_parts: number,
): Promise<void> {
  await writeMd(id, project_md, generated_parts);
}

export interface ProjectEditableFields {
  tech_stack?: string[];
  integrations?: string[];
  design_direction?: string;
  primary_color?: string;
  secondary_color?: string;
  motion_preference?: string;
  auth_type?: string;
}

export async function updateProjectFields(id: string, fields: ProjectEditableFields): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("kickstart_projects")
    .update(fields)
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

export async function saveMockupImages(id: string, mockup_images: string[]): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("kickstart_projects")
    .update({ mockup_images })
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
