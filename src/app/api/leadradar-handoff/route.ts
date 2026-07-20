import { NextRequest, NextResponse } from "next/server";
import { createProject, savePartialMd } from "@/lib/kickstart/queries";
import { streamPart } from "@/lib/kickstart/generate";
import { WizardFormData } from "@/lib/kickstart/types";

// Dedikert intake-endepunkt for LeadRadar (2026-07-20) — bevisst separat fra
// /api/kickstart/stream sin admin_session-cookie-gate. LeadRadar skal ALDRI
// holde det ekte admin-passordet (det gir full tilgang til admin-UI-et her,
// ikke bare "opprett prosjekt") — kun en egen, smalt scopet hemmelighet som
// kan roteres/trekkes tilbake uavhengig av Helges egen innlogging.
//
// Returnerer vanlig JSON (ikke SSE) — LeadRadar trenger ikke live streaming-
// fremdrift, kun prosjekt-ID-en når Del 1 er klar. Kun Del 1 av 12 genereres
// her; resten fullføres av Helge i kickstart sitt eget UI
// (ProjectDetailClient.tsx sin egen "Generer PROJECT.md"-løkke), samme
// resonnement som /api/kickstart/stream — hele 12-dels-generingen ville vært
// for lang til ett enkelt kall.
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.LEADRADAR_HANDOFF_SECRET || auth !== `Bearer ${process.env.LEADRADAR_HANDOFF_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: WizardFormData;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig JSON" }, { status: 400 });
  }

  if (!body.client_name || !body.project_name) {
    return NextResponse.json({ error: "client_name og project_name er påkrevd" }, { status: 400 });
  }

  try {
    const project = await createProject(body);
    console.log(`[leadradar-handoff] Prosjekt opprettet id=${project.id} klient="${body.client_name}"`);

    let part1Content = "";
    for await (const event of streamPart(body, 0, "")) {
      if (event.type === "part") part1Content = event.content;
    }
    await savePartialMd(project.id, part1Content);
    console.log(`[leadradar-handoff] Del 1/12 lagret — ${part1Content.length} tegn`);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://kickstart.mlit.no";

    return NextResponse.json({
      project_id: project.id,
      project_url: `${siteUrl}/admin/kickstart/${project.id}`,
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error(`[leadradar-handoff] FEIL: ${msg}`, e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
