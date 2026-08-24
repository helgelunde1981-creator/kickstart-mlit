import { NextRequest, NextResponse, after } from "next/server";
import { isTrustedWorkerRequest, isVercelCron } from "@/lib/kickstart/worker-auth";
import { listQueuedJobs, recoverStaleJobs } from "@/lib/kickstart/jobs";
import { triggerWorker } from "@/lib/kickstart/dispatch";
import { productionDeps, runNextPart } from "@/lib/kickstart/worker";
import { siteUrl } from "@/lib/kickstart/base-url";

export const runtime = "nodejs";
// Samme grense som worker: cron kjører en del selv når kjedingen ikke virker.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Vaktpost. Kjedingen mellom delene er rask, men ikke garantert: en lambda kan
 * dø midt i en del, og et selvkall kan bli blokkert av deployment protection.
 *
 * Derfor gjør denne to ting:
 *
 * 1. Setter jobber som står som «running» uten livstegn tilbake i kø.
 * 2. Kjører den første jobben i køen SELV, i denne invokasjonen, i stedet for
 *    bare å be worker-en om å gjøre det. Da fullfører en spec seg selv med én
 *    del hvert femte minutt selv om ingen HTTP-selvkall skulle komme fram —
 *    tregere, men det stopper aldri helt.
 *
 * Kjøres av Vercel Cron (se vercel.json). Kan også kalles manuelt med
 * worker-hemmeligheten hvis noe henger.
 */
export async function GET(req: NextRequest) {
  // Enten vår egen hemmelighet, eller Vercels egen cron-header (som er det
  // eneste vi får når CRON_SECRET ikke er satt).
  if (!isTrustedWorkerRequest(req) && !isVercelCron(req)) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }

  const recovered = await recoverStaleJobs();
  const queued = await listQueuedJobs(5);
  const origin = siteUrl(req);

  const [first, ...rest] = queued;

  if (first) {
    after(async () => {
      // Kjøres her, ikke via et nytt HTTP-kall — det er hele poenget med at
      // denne ruta er en reserve og ikke bare en dørklokke.
      const result = await runNextPart(first.id, productionDeps());
      if (result.outcome === "part_done" || result.outcome === "retry") {
        await triggerWorker(first.id, origin);
      }
    });
  }

  const started: string[] = [];
  for (const job of rest) {
    if (await triggerWorker(job.id, origin)) started.push(job.id);
  }

  if (recovered.length || queued.length) {
    console.log(
      `[cron] Gjenopprettet ${recovered.length} døde jobber, kjører ${first ? 1 : 0} selv, startet ${started.length} via worker`,
    );
  }

  return NextResponse.json({
    recovered: recovered.map((j) => j.id),
    running_here: first?.id ?? null,
    started,
    queued: queued.length,
  });
}
