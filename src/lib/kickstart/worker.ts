import { GenerationJob, JobStatus } from "./jobs";
import * as jobs from "./jobs";
import { KickstartProject, WizardFormData } from "./types";
import { getProject, savePartialMd, updateProjectMd } from "./queries";
import { streamPart, TOTAL_PARTS } from "./generate";
import { updateProjectMdInGitHub } from "./bootstrap/github";
import { verifyContent } from "./verify";

export const PART_SEPARATOR = "\n\n---\n\n";

/** Hvor ofte jobben sier fra at den lever mens en del skrives. */
const HEARTBEAT_MS = 30_000;

export type WorkerResult =
  | { outcome: "skipped"; reason: string }
  | { outcome: "part_done"; jobId: string; part: number; nextPart: number }
  | { outcome: "completed"; jobId: string; part: number }
  | { outcome: "retry"; jobId: string; message: string }
  | { outcome: "failed"; jobId: string; message: string };

/**
 * Alt worker-en trenger fra omverdenen. Injiseres for at tilstandsmaskinen
 * skal kunne testes uten database og uten å kalle Claude.
 */
export interface WorkerDeps {
  claimJob(jobId: string): Promise<GenerationJob | null>;
  getProject(projectId: string): Promise<KickstartProject | null>;
  generatePart(form: WizardFormData, partIndex: number, previousContent: string): Promise<string>;
  savePartial(projectId: string, md: string, partsDone: number): Promise<void>;
  saveFinal(projectId: string, md: string, partsDone: number): Promise<void>;
  releaseForNextPart(jobId: string, nextPart: number): Promise<void>;
  completeJob(jobId: string, totalParts: number): Promise<void>;
  registerFailure(job: GenerationJob, message: string): Promise<JobStatus>;
  heartbeat(jobId: string): Promise<void>;
  pushToGitHub(repoUrl: string, md: string): Promise<void>;
}

export function productionDeps(): WorkerDeps {
  return {
    claimJob: jobs.claimJob,
    getProject,
    generatePart: async (form, partIndex, previousContent) => {
      let content = "";
      for await (const event of streamPart(form, partIndex, previousContent)) {
        if (event.type === "part") content = event.content;
      }
      return content;
    },
    savePartial: savePartialMd,
    saveFinal: updateProjectMd,
    releaseForNextPart: jobs.releaseForNextPart,
    completeJob: jobs.completeJob,
    registerFailure: jobs.registerFailure,
    heartbeat: jobs.heartbeat,
    pushToGitHub: updateProjectMdInGitHub,
  };
}

export function toFormData(p: KickstartProject): WizardFormData {
  return {
    client_name:       p.client_name,
    project_name:      p.project_name,
    contact_person:    p.contact_person ?? "",
    new_domain:        p.new_domain ?? "",
    existing_url:      p.existing_url ?? "",
    project_type:      p.project_type,
    auth_type:         p.auth_type ?? "supabase-auth",
    sprint_estimate:   p.sprint_estimate ?? 6,
    requires_scrape:   p.requires_scrape ?? false,
    tech_stack:        p.tech_stack ?? [],
    integrations:      p.integrations ?? [],
    design_direction:  p.design_direction ?? "",
    primary_color:     p.primary_color ?? "",
    secondary_color:   p.secondary_color ?? "",
    motion_preference: p.motion_preference ?? "subtil",
    features:          p.features ?? "",
    extra_notes:       p.extra_notes ?? "",
    short_description: p.short_description ?? "",
    long_description:  p.long_description ?? "",
  };
}

/**
 * Genererer ÉN del og lar jobben stå klar til neste. Én del per invokasjon er
 * poenget: da holder hver kjøring seg godt innenfor 300 s, og et krasj koster
 * maks én del — ikke hele specen.
 */
export async function runNextPart(jobId: string, deps: WorkerDeps): Promise<WorkerResult> {
  let job: GenerationJob | null;
  try {
    job = await deps.claimJob(jobId);
  } catch (e) {
    // Databasen svarte ikke. Jobben står fortsatt i kø — vaktposten tar den.
    const message = (e as Error).message;
    console.error(`[worker] Klarte ikke ta jobb ${jobId}: ${message}`);
    return { outcome: "skipped", reason: message };
  }

  if (!job) {
    // En annen worker tok den, eller jobben er ferdig/avbrutt.
    return { outcome: "skipped", reason: "Jobben var ikke i kø" };
  }

  const partIndex = job.next_part - 1;
  const isLastPart = job.next_part >= job.total_parts;

  const beat = setInterval(() => {
    deps.heartbeat(job.id).catch(() => {});
  }, HEARTBEAT_MS);

  try {
    const project = await deps.getProject(job.project_id);
    if (!project) throw new Error(`Prosjekt ${job.project_id} finnes ikke lenger`);
    if (partIndex < 0 || partIndex >= job.total_parts) {
      throw new Error(`Ugyldig del ${job.next_part} av ${job.total_parts}`);
    }

    const previousContent = partIndex === 0 ? "" : (project.project_md ?? "");
    if (partIndex > 0 && !previousContent) {
      throw new Error(
        `Kan ikke fortsette på del ${job.next_part}: prosjektet har ingen lagret tekst`,
      );
    }

    const partContent = await deps.generatePart(toFormData(project), partIndex, previousContent);
    if (!partContent.trim()) throw new Error(`Del ${job.next_part} kom tom tilbake fra modellen`);

    const combined = previousContent ? previousContent + PART_SEPARATOR + partContent : partContent;
    const partsDone = job.next_part;

    if (isLastPart) {
      await deps.saveFinal(project.id, combined, partsDone);
      await deps.completeJob(job.id, job.total_parts);

      if (project.github_repo_url) {
        try {
          await deps.pushToGitHub(project.github_repo_url, combined);
        } catch (e) {
          // Ikke fatalt: specen er lagret. Logges, men velter ikke jobben.
          console.error(`[worker] GitHub-push feilet: ${(e as Error).message}`);
        }
      }

      const verify = verifyContent(combined);
      console.log(
        `[worker] Jobb ${job.id} ferdig — ${combined.length} tegn, verifisering ${
          verify.ok ? "OK" : `mangler: ${verify.checks.filter((c) => !c.ok).map((c) => c.label).join(", ")}`
        }`,
      );
      return { outcome: "completed", jobId: job.id, part: partsDone };
    }

    await deps.savePartial(project.id, combined, partsDone);
    await deps.releaseForNextPart(job.id, partsDone + 1);
    console.log(`[worker] Jobb ${job.id}: del ${partsDone}/${job.total_parts} lagret`);
    return { outcome: "part_done", jobId: job.id, part: partsDone, nextPart: partsDone + 1 };
  } catch (e) {
    const message = (e as Error).message;
    const status = await deps.registerFailure(job, message).catch((dbError) => {
      console.error(`[worker] Klarte ikke registrere feil på jobb ${job.id}: ${(dbError as Error).message}`);
      return "queued" as const;
    });
    console.error(
      `[worker] Jobb ${job.id} del ${job.next_part} feilet (forsøk ${job.attempts + 1}): ${message}`,
    );
    return status === "failed"
      ? { outcome: "failed", jobId: job.id, message }
      : { outcome: "retry", jobId: job.id, message };
  } finally {
    clearInterval(beat);
  }
}

export { TOTAL_PARTS };
