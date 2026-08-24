"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export interface ProjectRow {
  id: string;
  project_name: string;
  client_name: string;
  short_description: string | null;
  status: string;
  primary_color: string | null;
  created_at: string;
  created_at_label: string;
  generated_parts: number;
  total_parts: number;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Utkast",
  generated: "Generert",
  bootstrapped: "Bootstrapped",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-warning-soft text-warning",
  generated: "bg-accent-soft text-accent",
  bootstrapped: "bg-success-soft text-success",
};

const FILTERS = [
  { id: "alle", label: "Alle" },
  { id: "draft", label: "Utkast" },
  { id: "generated", label: "Generert" },
  { id: "bootstrapped", label: "Bootstrapped" },
];

export default function ProjectList({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("alle");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (status !== "alle" && p.status !== status) return false;
      if (!q) return true;
      return (
        p.project_name.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q) ||
        (p.short_description ?? "").toLowerCase().includes(q)
      );
    });
  }, [projects, query, status]);

  return (
    <div className="space-y-4">
      {/* Søk og filter dukker først opp når det faktisk er nok til å lete i. */}
      {projects.length > 4 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor="prosjektsok" className="sr-only">
              Søk i prosjekter
            </label>
            <input
              id="prosjektsok"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk på kunde, prosjekt eller beskrivelse…"
              className="input"
            />
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Filtrer på status">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatus(f.id)}
                aria-pressed={status === f.id}
                className="choice px-3 py-2 text-xs font-medium"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {visible.length} prosjekter vises
      </p>

      {visible.length === 0 ? (
        <div className="card p-8 text-center text-sm text-muted">
          Ingen prosjekter matcher søket.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((p, idx) => {
            const inProgress =
              p.status === "draft" && p.generated_parts > 0 && p.generated_parts < p.total_parts;
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/kickstart/${p.id}`}
                  className="card block p-4 transition-colors hover:border-accent"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        {idx === 0 && status === "alle" && !query && (
                          <span className="badge bg-accent text-on-accent">SIST</span>
                        )}
                        {p.primary_color && (
                          <span
                            aria-hidden
                            className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-line"
                            style={{ backgroundColor: p.primary_color }}
                          />
                        )}
                        <span className="font-medium">{p.project_name}</span>
                        <span className="text-sm text-faint">·</span>
                        <span className="text-sm text-muted">{p.client_name}</span>
                      </div>
                      {p.short_description && (
                        <p className="line-clamp-2 text-sm text-muted">{p.short_description}</p>
                      )}
                      {inProgress && (
                        <p className="mt-1.5 text-xs font-medium text-warning">
                          Delvis generert — del {p.generated_parts} av {p.total_parts}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className={`badge ${STATUS_STYLES[p.status] ?? "bg-surface-2 text-muted"}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                      <time dateTime={p.created_at} className="whitespace-nowrap text-xs text-faint">
                        {p.created_at_label}
                      </time>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
