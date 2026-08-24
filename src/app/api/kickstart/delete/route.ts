import { NextRequest, NextResponse } from "next/server";
import { deleteProject, getProject } from "@/lib/kickstart/queries";

export const runtime = "nodejs";

// Gated av proxy.ts (matcher /api/kickstart/:path*). Sletting fantes i
// queries.ts men var aldri koblet til noe — utkast hopet seg opp i listen.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { id?: string; confirm_name?: string } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "id er påkrevd" }, { status: 400 });
  }

  const project = await getProject(body.id);
  if (!project) {
    return NextResponse.json({ error: "Prosjekt ikke funnet" }, { status: 404 });
  }

  // Sletting er ikke reversibel og tar med seg en spec det tok 15 minutter og
  // ekte penger å lage — derfor må klienten sende prosjektnavnet tilbake.
  if (body.confirm_name !== project.project_name) {
    return NextResponse.json(
      { error: "Bekreftelsen matcher ikke prosjektnavnet" },
      { status: 400 },
    );
  }

  try {
    await deleteProject(body.id);
    console.log(`[delete] Prosjekt ${body.id} "${project.project_name}" slettet`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
