import { NextRequest, NextResponse } from "next/server";
import { createProject, getProject } from "@/lib/kickstart/queries";
import { TOTAL_PARTS } from "@/lib/kickstart/generate";
import { cancelActiveJobs, enqueueJob } from "@/lib/kickstart/jobs";
import { triggerWorker } from "@/lib/kickstart/dispatch";
import { siteUrl } from "@/lib/kickstart/base-url";
import { wizardSchema } from "@/lib/kickstart/validation";
import { WizardFormData } from "@/lib/kickstart/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body extends Partial<WizardFormData> {
  project_id?: string;
  /** Start forfra og skriv over det som ligger der. */
  regenerate?: boolean;
}

/**
 * Starter et genereringsløp og svarer med en gang. Alt arbeid skjer i
 * bakgrunnen (se worker-ruta) — klienten trenger bare å følge med på status.
 *
 * Gated av proxy.ts sin admin-cookie.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });

  try {
    let projectId: string;
    let fromPart: number;

    if (!body.project_id) {
      const parsed = wizardSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Ugyldige prosjektdata",
            details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
          },
          { status: 400 },
        );
      }
      const project = await createProject(parsed.data as WizardFormData);
      projectId = project.id;
      fromPart = 1;
      console.log(`[generate] Nytt prosjekt ${project.id} — "${project.client_name}"`);
    } else {
      const project = await getProject(body.project_id);
      if (!project) return NextResponse.json({ error: "Prosjekt ikke funnet" }, { status: 404 });
      projectId = project.id;

      if (body.regenerate) {
        await cancelActiveJobs(projectId, "Erstattet av ny full generering");
        fromPart = 1;
      } else {
        const done = project.generated_parts ?? (project.project_md ? 1 : 0);
        if (done >= TOTAL_PARTS) {
          return NextResponse.json(
            { error: "Specen er allerede komplett. Bruk «Regenerer spec» for å lage den på nytt." },
            { status: 409 },
          );
        }
        fromPart = done + 1;
      }
    }

    const { job, created } = await enqueueJob(projectId, fromPart, TOTAL_PARTS);
    if (created) {
      console.log(`[generate] Jobb ${job.id} lagt i kø fra del ${fromPart}`);
    }

    // Starter første del nå, på samme domene som nettleseren brukte hit.
    // Feiler dette, tar cron-vaktposten jobben.
    const started = await triggerWorker(job.id, siteUrl(req));

    return NextResponse.json({ project_id: projectId, job, started }, { status: 202 });
  } catch (e) {
    const message = (e as Error).message;
    console.error(`[generate] FEIL: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
