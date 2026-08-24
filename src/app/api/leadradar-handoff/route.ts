import { NextRequest, NextResponse } from "next/server";
import { createProject } from "@/lib/kickstart/queries";
import { TOTAL_PARTS } from "@/lib/kickstart/generate";
import { enqueueJob } from "@/lib/kickstart/jobs";
import { triggerWorker } from "@/lib/kickstart/dispatch";
import { safeEqual } from "@/lib/auth/session";
import { handoffSchema, toWizardFormData } from "@/lib/kickstart/validation";
import { siteUrl } from "@/lib/kickstart/base-url";

// Dedikert intake-endepunkt for LeadRadar (2026-07-20) — bevisst separat fra
// admin_session-cookie-gaten i /api/kickstart/*. LeadRadar skal ALDRI holde det
// ekte admin-passordet (det gir full tilgang til admin-UI-et her, ikke bare
// "opprett prosjekt") — kun en egen, smalt scopet hemmelighet som kan roteres
// eller trekkes tilbake uavhengig av Helges egen innlogging.
//
// Endepunktet genererer ikke lenger noe selv. Det oppretter prosjektet og
// legger et genereringsløp i kø, slik at svaret kommer på under et sekund i
// stedet for å holde LeadRadar ventende i opptil 300 s på del 1.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.LEADRADAR_HANDOFF_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  if (raw === null) {
    return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });
  }

  // LeadRadar er en annen app med sitt eget tempo — den sender ikke
  // nødvendigvis alle felter. Skjemaet fyller inn defaults i stedet for å la
  // undefined havne i databasen.
  const parsed = handoffSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ugyldige felter", details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
      { status: 400 },
    );
  }
  const body = toWizardFormData(parsed.data);

  try {
    const project = await createProject(body);
    const { job } = await enqueueJob(project.id, 1, TOTAL_PARTS);
    await triggerWorker(job.id, siteUrl(req));

    console.log(
      `[leadradar-handoff] Prosjekt ${project.id} opprettet for "${body.client_name}", jobb ${job.id} i kø`,
    );

    return NextResponse.json({
      project_id: project.id,
      project_url: `${siteUrl(req)}/admin/kickstart/${project.id}`,
      job_id: job.id,
      status: "queued",
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error(`[leadradar-handoff] FEIL: ${msg}`, e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
