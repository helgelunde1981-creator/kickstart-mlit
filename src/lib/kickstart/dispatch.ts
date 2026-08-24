import { siteUrl } from "./base-url";
import { workerAuthHeader } from "./worker-auth";

/**
 * Sparker i gang neste del. Kallet svarer med en gang (worker-en gjør jobben
 * etter at responsen er sendt), så dette henger ikke.
 *
 * Feiler det, er det ikke kritisk: cron-vaktposten plukker opp jobber som blir
 * stående i kø.
 */
export async function triggerWorker(jobId: string): Promise<boolean> {
  try {
    const res = await fetch(`${siteUrl()}/api/kickstart/worker`, {
      method: "POST",
      headers: { ...workerAuthHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[dispatch] Worker svarte ${res.status} for jobb ${jobId}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[dispatch] Klarte ikke starte worker for jobb ${jobId}: ${(e as Error).message}`);
    return false;
  }
}
