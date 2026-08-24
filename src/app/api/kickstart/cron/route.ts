import { NextRequest, NextResponse } from "next/server";
import { isTrustedWorkerRequest } from "@/lib/kickstart/worker-auth";
import { listQueuedJobs, recoverStaleJobs } from "@/lib/kickstart/jobs";
import { triggerWorker } from "@/lib/kickstart/dispatch";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Vaktpost. Kjedingen mellom delene er rask, men ikke garantert: en lambda kan
 * dø midt i en del, og da står jobben stille uten at noen merker det.
 *
 * Kjøres av Vercel Cron (se vercel.json). Kan også kalles manuelt med
 * worker-hemmeligheten hvis noe henger.
 */
export async function GET(req: NextRequest) {
  if (!isTrustedWorkerRequest(req)) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }

  const recovered = await recoverStaleJobs();
  const queued = await listQueuedJobs(5);

  // triggerWorker svarer med en gang — arbeidet skjer i worker-invokasjonen.
  const started: string[] = [];
  for (const job of queued) {
    if (await triggerWorker(job.id)) started.push(job.id);
  }

  if (recovered.length || started.length) {
    console.log(
      `[cron] Gjenopprettet ${recovered.length} døde jobber, startet ${started.length} i kø`,
    );
  }

  return NextResponse.json({
    recovered: recovered.map((j) => j.id),
    started,
    queued: queued.length,
  });
}
