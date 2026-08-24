"use client";
import { useEffect, useRef } from "react";
import { GenerationState } from "./useSpecGeneration";

const KIND_STYLES: Record<string, string> = {
  info: "text-[#9aa3b5]",
  ok: "text-[#66d19e]",
  warn: "text-[#e6b25c]",
  error: "text-[#ff8079]",
};

const KIND_PREFIX: Record<string, string> = {
  info: "▶",
  ok: "✓",
  warn: "!",
  error: "✗",
};

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function GenerationPanel({ state }: { state: GenerationState }) {
  const logRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state.log]);

  useEffect(() => {
    if (liveRef.current) liveRef.current.scrollTop = liveRef.current.scrollHeight;
  }, [state.liveText]);

  const done = state.part > 0 ? state.part - (state.running ? 1 : 0) : 0;
  const percent = state.finished ? 100 : Math.round((done / state.totalParts) * 100);

  return (
    <section className="card overflow-hidden" aria-label="Fremdrift for generering">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">
            {state.failed
              ? "Generering stoppet"
              : state.finished
                ? "PROJECT.md er ferdig"
                : `Genererer — del ${Math.max(state.part, 1)} av ${state.totalParts}`}
          </h2>
          {state.partTitle && (
            <p className="truncate font-mono text-xs text-faint" title={state.partTitle}>
              {state.partTitle}
            </p>
          )}
        </div>
        {state.running && (
          <span className="shrink-0 font-mono text-xs text-muted" aria-label="Medgått tid">
            {formatElapsed(state.elapsedSeconds)}
          </span>
        )}
      </div>

      {/* Fremdrift i tall og som stolpe — 12 deler tar 10–20 minutter, og da
          holder det ikke med en spinner. */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={state.totalParts}
        aria-valuenow={done}
        aria-valuetext={`Del ${done} av ${state.totalParts} ferdig`}
        className="h-1 w-full bg-surface-2"
      >
        <div
          className={`h-full transition-[width] duration-500 ${state.failed ? "bg-danger" : "bg-accent"}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div
        ref={logRef}
        aria-live="polite"
        className="terminal max-h-40 space-y-0.5 overflow-y-auto px-4 py-3"
      >
        {state.log.map((line, i) => (
          <div key={i} className={KIND_STYLES[line.kind]}>
            {KIND_PREFIX[line.kind]} {line.text}
          </div>
        ))}
        {state.running && <div className="animate-pulse text-[#7b93ff]">▋</div>}
      </div>

      {state.liveText && (
        <pre
          ref={liveRef}
          className="terminal max-h-80 overflow-y-auto whitespace-pre-wrap break-words border-t border-[#1d222c] px-4 py-3 text-[#a9d7bd]"
        >
          {state.liveText}
        </pre>
      )}

      {state.verifyChecks && (
        <div className="grid gap-x-4 gap-y-1 border-t border-line px-4 py-3 sm:grid-cols-2">
          {state.verifyChecks.map((c, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 font-mono text-xs ${c.ok ? "text-success" : "text-danger"}`}
            >
              <span aria-hidden>{c.ok ? "✓" : "✗"}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
