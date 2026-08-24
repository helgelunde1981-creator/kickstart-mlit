"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface GenerationJobView {
  id: string;
  status: JobStatus;
  next_part: number;
  total_parts: number;
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobSnapshot {
  project: {
    id: string;
    status: string;
    generated_parts: number;
    total_parts: number;
    has_spec: boolean;
  };
  job: GenerationJobView | null;
  tail: string;
  total_chars: number;
}

export interface GenerationJobState {
  snapshot: JobSnapshot | null;
  projectId: string | null;
  /** Vi har bedt om start, men vet ennå ikke hva serveren gjorde. */
  starting: boolean;
  error: string | null;
  /** Ikke en feil, men verdt å si fra om — f.eks. at køen venter på vaktposten. */
  notice: string | null;
}

const ACTIVE: JobStatus[] = ["queued", "running"];
const POLL_MS = 4000;
/** Når fanen ikke er synlig trenger vi ikke oppdatere like ofte. */
const POLL_HIDDEN_MS = 20_000;

export function isActive(job: GenerationJobView | null | undefined): boolean {
  return Boolean(job && ACTIVE.includes(job.status));
}

/**
 * Følger et genereringsløp ved å spørre serveren om status.
 *
 * Poenget: klienten *observerer*, den driver ikke. Genereringen kjører i
 * bakgrunnen på serveren, så en låst telefonskjerm, en lukket fane eller et
 * tapt nett stopper ingenting — man kommer bare tilbake til en oppdatert side.
 */
export function useGenerationJob(initialProjectId: string | null) {
  const [state, setState] = useState<GenerationJobState>({
    snapshot: null,
    projectId: initialProjectId,
    starting: false,
    error: null,
    notice: null,
  });

  const projectIdRef = useRef<string | null>(initialProjectId);
  const stateRef = useRef(state);
  stateRef.current = state;
  /** Stopper pollingen hvis endepunktet svarer feil gang på gang. */
  const failuresRef = useRef(0);

  const poll = useCallback(async () => {
    const projectId = projectIdRef.current;
    if (!projectId) return;

    try {
      const res = await fetch(`/api/kickstart/job?project_id=${encodeURIComponent(projectId)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        failuresRef.current += 1;
        if (failuresRef.current >= 5) {
          setState((prev) => ({
            ...prev,
            starting: false,
            error: `Fikk ikke status fra serveren (${res.status}). Last siden på nytt.`,
          }));
        }
        return;
      }
      failuresRef.current = 0;
      const snapshot = (await res.json()) as JobSnapshot;
      setState((prev) => ({ ...prev, snapshot, starting: false, error: null }));
    } catch {
      // Nettverket kan komme og gå — neste runde prøver igjen.
      failuresRef.current += 1;
    }
  }, []);

  // Selvplanleggende løkke: neste kall settes opp når forrige er ferdig, så
  // trege svar ikke hoper seg opp. Stopper når jobben ikke lenger er aktiv.
  useEffect(() => {
    if (!state.projectId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = async () => {
      await poll();
      if (cancelled) return;

      const current = stateRef.current;
      const givenUp = failuresRef.current >= 5;
      const keepGoing = !givenUp && (isActive(current.snapshot?.job) || current.starting || !current.snapshot);
      if (!keepGoing) return;

      const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
      timer = setTimeout(run, hidden ? POLL_HIDDEN_MS : POLL_MS);
    };

    run();

    // Tilbake til fanen: hent status med en gang i stedet for å vente ut
    // det lange intervallet.
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        run();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [poll, state.projectId, state.starting, state.snapshot?.job?.status]);

  /**
   * Ber serveren starte (eller fortsette) et løp. Svarer nesten umiddelbart —
   * selve genereringen skjer i bakgrunnen.
   */
  const start = useCallback(
    async (payload: object): Promise<string | null> => {
      failuresRef.current = 0;
      setState((prev) => ({ ...prev, starting: true, error: null, notice: null }));
      try {
        const res = await fetch("/api/kickstart/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => null)) as
          | { project_id?: string; started?: boolean; error?: string; details?: string[] }
          | null;

        if (!res.ok) {
          const message = [data?.error, ...(data?.details ?? [])].filter(Boolean).join(" — ");
          setState((prev) => ({
            ...prev,
            starting: false,
            error: message || `Serverfeil: ${res.status}`,
          }));
          return null;
        }

        const projectId = data?.project_id ?? projectIdRef.current;
        projectIdRef.current = projectId ?? null;
        setState((prev) => ({
          ...prev,
          projectId: projectId ?? null,
          // Jobben ER lagt i kø; serveren fikk bare ikke sparket den i gang med
          // en gang. Vaktposten tar den — men brukeren skal slippe å lure.
          notice:
            data?.started === false
              ? "Jobben ligger i kø, men serveren fikk ikke startet den umiddelbart. Vaktposten plukker den opp innen fem minutter."
              : null,
        }));
        await poll();
        return projectId ?? null;
      } catch (e) {
        setState((prev) => ({ ...prev, starting: false, error: (e as Error).message }));
        return null;
      }
    },
    [poll],
  );

  return { state, start, refresh: poll };
}
