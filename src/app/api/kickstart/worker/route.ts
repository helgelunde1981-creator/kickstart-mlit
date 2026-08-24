import { NextRequest, NextResponse, after } from "next/server";
import { isTrustedWorkerRequest } from "@/lib/kickstart/worker-auth";
import { listQueuedJobs } from "@/lib/kickstart/jobs";
import { productionDeps, runNextPart } from "@/lib/kickstart/worker";
import { triggerWorker } from "@/lib/kickstart/dispatch";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const RETRY_DELAY_MS = 5_000;

/**
 * Genererer én del av en spec, og kjeder seg selv videre til neste.
 *
 * Selve arbeidet skjer i `after()` — responsen sendes med en gang, slik at den
 * som kalte oss (nettleseren, forrige del eller cron) ikke må vente i minutter.
 * Det er dette som gjør at genereringen overlever at telefonen låser seg.
 */
export async function POST(req: NextRequest) {
  if (!isTrustedWorkerRequest(req)) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { job_id?: string } | null;
  let jobId = body?.job_id;

  if (!jobId) {
    const [next] = await listQueuedJobs(1);
    if (!next) return NextResponse.json({ ok: true, message: "Ingen jobber i kø" });
    jobId = next.id;
  }

  const id = jobId;
  after(async () => {
    const result = await runNextPart(id, productionDeps());

    if (result.outcome === "part_done") {
      await triggerWorker(id);
    } else if (result.outcome === "retry") {
      // Kort pause så et umiddelbart gjentagende problem ikke blir en tett løkke.
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      await triggerWorker(id);
    }
  });

  return NextResponse.json({ accepted: true, job_id: id }, { status: 202 });
}
