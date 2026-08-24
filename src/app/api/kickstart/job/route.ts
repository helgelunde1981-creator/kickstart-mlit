import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/kickstart/queries";
import { getActiveJob, getLatestJob } from "@/lib/kickstart/jobs";
import { supabaseAdmin } from "@/lib/supabase";
import { TOTAL_PARTS } from "@/lib/kickstart/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAIL_LENGTH = 1400;

/**
 * Status for et prosjekts genereringsløp. Klienten poller denne i stedet for å
 * holde en strøm åpen — da spiller det ingen rolle om telefonen låser seg,
 * fanen lukkes eller nettet forsvinner underveis.
 */
export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("project_id");
  if (!projectId) {
    return NextResponse.json({ error: "project_id er påkrevd" }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Prosjekt ikke funnet" }, { status: 404 });

  const job = (await getActiveJob(projectId)) ?? (await getLatestJob(projectId));

  return NextResponse.json({
    project: {
      id: project.id,
      status: project.status,
      generated_parts: project.generated_parts ?? (project.project_md ? 1 : 0),
      total_parts: TOTAL_PARTS,
      has_spec: Boolean(project.project_md),
    },
    job,
    ...(await tail(projectId)),
  });
}

/** Siste linjer av specen — nok til å se at det faktisk skrives noe. */
async function tail(projectId: string): Promise<{ tail: string; total_chars: number }> {
  const { data, error } = await supabaseAdmin().rpc("kickstart_project_tail", {
    p_id: projectId,
    p_len: TAIL_LENGTH,
  });

  if (error || !Array.isArray(data) || data.length === 0) {
    // Funksjonen kommer med migrasjonen; mangler den, klarer vi oss uten halen.
    return { tail: "", total_chars: 0 };
  }
  const row = data[0] as { tail: string | null; total_chars: number | null };
  return { tail: row.tail ?? "", total_chars: row.total_chars ?? 0 };
}
