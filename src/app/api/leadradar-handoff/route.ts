import { NextRequest, NextResponse } from "next/server";
import { createProject, savePartialMd } from "@/lib/kickstart/queries";
import { streamPart } from "@/lib/kickstart/generate";
import { safeEqual } from "@/lib/auth/session";
import { handoffSchema, toWizardFormData } from "@/lib/kickstart/validation";

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
// Del 1 alene kan ta over 120s (bekreftet via FUNCTION_INVOCATION_TIMEOUT i
// live-test 2026-07-20) — matcher derfor /api/kickstart/stream sin egen
// grense fremfor å anta et lavere tall holder.
export const maxDuration = 300;

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
    console.log(`[leadradar-handoff] Prosjekt opprettet id=${project.id} klient="${body.client_name}"`);

    let part1Content = "";
    for await (const event of streamPart(body, 0, "")) {
      if (event.type === "part") part1Content = event.content;
    }
    if (!part1Content.trim()) {
      throw new Error("Del 1 kom tom tilbake fra modellen");
    }
    await savePartialMd(project.id, part1Content, 1);
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
