import { supabaseAdmin } from "@/lib/supabase";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface GenerationJob {
  id: string;
  project_id: string;
  status: JobStatus;
  next_part: number;
  total_parts: number;
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  heartbeat_at: string | null;
  completed_at: string | null;
}

const TABLE = "kickstart_generation_jobs";

/** Forsøk på samme del før jobben gis opp. streamPart har egne retries inni ett forsøk. */
export const MAX_ATTEMPTS_PER_PART = 3;

/**
 * En kjørende del som ikke har gitt livstegn på denne tiden regnes som død.
 * maxDuration er 300 s, så marginen dekker en hel del pluss oppstart.
 */
export const STALE_AFTER_MS = 8 * 60 * 1000;

export const ACTIVE_STATUSES: JobStatus[] = ["queued", "running"];

export async function getActiveJob(projectId: string): Promise<GenerationJob | null> {
  const { data } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .eq("project_id", projectId)
    .in("status", ACTIVE_STATUSES)
    .maybeSingle();
  return (data as GenerationJob) ?? null;
}

export async function getLatestJob(projectId: string): Promise<GenerationJob | null> {
  const { data } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as GenerationJob) ?? null;
}

export async function getJob(jobId: string): Promise<GenerationJob | null> {
  const { data } = await supabaseAdmin().from(TABLE).select("*").eq("id", jobId).maybeSingle();
  return (data as GenerationJob) ?? null;
}

export async function cancelActiveJobs(projectId: string, reason: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLE)
    .update({ status: "cancelled", last_error: reason, completed_at: new Date().toISOString() })
    .eq("project_id", projectId)
    .in("status", ACTIVE_STATUSES);
  if (error) throw error;
}

/**
 * Legger et løp i kø. Finnes det allerede et aktivt løp, returneres det —
 * to jobber på samme prosjekt ville skrevet over hverandres deler.
 */
export async function enqueueJob(
  projectId: string,
  fromPart: number,
  totalParts: number,
): Promise<{ job: GenerationJob; created: boolean }> {
  const existing = await getActiveJob(projectId);
  if (existing) return { job: existing, created: false };

  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .insert({
      project_id: projectId,
      status: "queued",
      next_part: fromPart,
      total_parts: totalParts,
      attempts: 0,
    })
    .select()
    .single();

  if (error) {
    // Kappløp mot en annen forespørsel: unik-indeksen holdt, bruk deres jobb.
    const raced = await getActiveJob(projectId);
    if (raced) return { job: raced, created: false };
    throw error;
  }
  return { job: data as GenerationJob, created: true };
}

/**
 * Tar jobben. `.eq("status", "queued")` gjør dette atomisk i Postgres: to
 * samtidige workere kan ikke begge få raden.
 */
export async function claimJob(jobId: string): Promise<GenerationJob | null> {
  const { data, error } = await supabaseAdmin()
    .from(TABLE)
    .update({ status: "running", heartbeat_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("status", "queued")
    .select()
    .maybeSingle();
  if (error) throw error;
  return (data as GenerationJob) ?? null;
}

export async function heartbeat(jobId: string): Promise<void> {
  await supabaseAdmin()
    .from(TABLE)
    .update({ heartbeat_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("status", "running");
}

/** Del ferdig: tilbake i kø for neste del, med forsøkstelleren nullstilt. */
export async function releaseForNextPart(jobId: string, nextPart: number): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLE)
    .update({ status: "queued", next_part: nextPart, attempts: 0, last_error: null })
    .eq("id", jobId);
  if (error) throw error;
}

export async function completeJob(jobId: string, totalParts: number): Promise<void> {
  const { error } = await supabaseAdmin()
    .from(TABLE)
    .update({
      status: "completed",
      next_part: totalParts + 1,
      attempts: 0,
      last_error: null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
  if (error) throw error;
}

/** Feil på en del: enten nytt forsøk (tilbake i kø) eller gi opp. */
export async function registerFailure(job: GenerationJob, message: string): Promise<JobStatus> {
  const attempts = job.attempts + 1;
  const giveUp = attempts >= MAX_ATTEMPTS_PER_PART;

  const { error } = await supabaseAdmin()
    .from(TABLE)
    .update({
      status: giveUp ? "failed" : "queued",
      attempts,
      last_error: message.slice(0, 2000),
      ...(giveUp ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq("id", job.id);
  if (error) throw error;

  return giveUp ? "failed" : "queued";
}

export async function listQueuedJobs(limit = 5): Promise<GenerationJob[]> {
  const { data } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .eq("status", "queued")
    .order("updated_at", { ascending: true })
    .limit(limit);
  return (data as GenerationJob[]) ?? [];
}

/**
 * Jobber som står som «running» uten livstegn — typisk en lambda som ble
 * avlivet midt i en del. Settes tilbake i kø, eller til failed når forsøkene
 * er brukt opp.
 */
export async function recoverStaleJobs(now = Date.now()): Promise<GenerationJob[]> {
  const cutoff = new Date(now - STALE_AFTER_MS).toISOString();
  const { data } = await supabaseAdmin()
    .from(TABLE)
    .select("*")
    .eq("status", "running")
    // Verdien siteres: tidsstempelet inneholder tegn PostgREST ellers kan
    // tolke som en del av filteruttrykket.
    .or(`heartbeat_at.is.null,heartbeat_at.lt."${cutoff}"`);

  const stale = (data as GenerationJob[]) ?? [];
  for (const job of stale) {
    await registerFailure(job, "Kjøringen stoppet uten å fullføre delen (ingen livstegn)");
  }
  return stale;
}
