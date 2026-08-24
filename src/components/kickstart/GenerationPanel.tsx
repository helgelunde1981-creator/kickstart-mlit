"use client";
import { useEffect, useRef, useState } from "react";
import { PART_TITLES } from "@/lib/kickstart/parts";
import { GenerationJobState, isActive } from "./useGenerationJob";

function formatElapsed(fromIso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(fromIso).getTime()) / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function GenerationPanel({ state }: { state: GenerationJobState }) {
  const tailRef = useRef<HTMLPreElement>(null);
  const [now, setNow] = useState<number | null>(null);

  const snapshot = state.snapshot;
  const job = snapshot?.job ?? null;
  const running = isActive(job) || state.starting;

  // Klokka starter først på klienten — server og klient ville ellers rendret
  // ulik tid og gitt hydreringsfeil.
  useEffect(() => {
    if (!running) return;
    const first = setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [running]);

  useEffect(() => {
    if (tailRef.current) tailRef.current.scrollTop = tailRef.current.scrollHeight;
  }, [snapshot?.tail]);

  const totalParts = snapshot?.project.total_parts ?? job?.total_parts ?? PART_TITLES.length;
  const done = snapshot?.project.generated_parts ?? 0;
  const percent = Math.round((done / totalParts) * 100);
  const currentPart = job ? Math.min(job.next_part, totalParts) : done + 1;
  const partTitle = PART_TITLES[currentPart - 1] ?? "";

  const heading = state.starting
    ? "Starter generering…"
    : job?.status === "completed"
      ? "PROJECT.md er ferdig"
      : job?.status === "failed"
        ? "Genereringen stoppet"
        : job?.status === "cancelled"
          ? "Genereringen ble avbrutt"
          : job?.status === "running"
            ? `Skriver del ${currentPart} av ${totalParts}`
            : job?.status === "queued"
              ? `I kø — del ${currentPart} av ${totalParts}`
              : `${done} av ${totalParts} deler ferdig`;

  return (
    <section className="card overflow-hidden" aria-label="Status for generering">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{heading}</h2>
          {running && partTitle && (
            <p className="truncate font-mono text-xs text-faint" title={partTitle}>
              {partTitle}
            </p>
          )}
        </div>
        {running && job && now !== null && (
          <span className="shrink-0 font-mono text-xs text-muted" aria-label="Tid siden start">
            {formatElapsed(job.created_at, now)}
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalParts}
        aria-valuenow={done}
        aria-valuetext={`${done} av ${totalParts} deler ferdig`}
        className="h-1 w-full bg-surface-2"
      >
        <div
          className={`h-full transition-[width] duration-700 ${
            job?.status === "failed" ? "bg-danger" : "bg-accent"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="space-y-3 px-4 py-3">
        <p aria-live="polite" className="text-sm text-muted">
          {running ? (
            <>
              <span className="font-medium text-fg">
                Du kan lukke fanen eller låse telefonen.
              </span>{" "}
              Genereringen kjører på serveren og fortsetter uansett — kom tilbake hit når du vil for
              å se hvor langt den er kommet.
            </>
          ) : job?.status === "completed" ? (
            `Alle ${totalParts} delene er generert og lagret.`
          ) : job?.status === "failed" ? (
            "Delene som ble ferdige er lagret. Du kan fortsette derfra."
          ) : (
            `${done} av ${totalParts} deler er lagret.`
          )}
        </p>

        {job?.last_error && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
            Siste feil (forsøk {job.attempts} av 3): {job.last_error}
          </p>
        )}

        {state.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}

        {snapshot && snapshot.total_chars > 0 && (
          <p className="text-xs text-faint">
            {snapshot.total_chars.toLocaleString("nb-NO")} tegn skrevet
          </p>
        )}
      </div>

      {snapshot?.tail && (
        <div className="border-t border-line">
          <p className="px-4 pt-3 text-xs text-faint">Siste lagrede tekst</p>
          <pre
            ref={tailRef}
            className="terminal mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words px-4 py-3 text-[#a9d7bd]"
          >
            {snapshot.tail}
          </pre>
        </div>
      )}
    </section>
  );
}
