"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KickstartProject, PriceEstimate, BootstrapResult } from "@/lib/kickstart/types";
import { DESIGN_DIRECTIONS, PROJECT_TYPES, TECH_OPTIONS, AUTH_OPTIONS } from "@/lib/kickstart/tech-options";
import ProjectEditForm from "@/components/kickstart/ProjectEditForm";
import GenerationPanel from "@/components/kickstart/GenerationPanel";
import { useSpecGeneration } from "@/components/kickstart/useSpecGeneration";

function labelOf(id: string | null, options: { id: string; label: string }[]): string {
  if (!id) return "–";
  return options.find((o) => o.id === id)?.label ?? id;
}

export default function ProjectDetailClient({
  project: initial,
  totalParts,
}: {
  project: KickstartProject;
  totalParts: number;
}) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [editing, setEditing] = useState(false);

  // router.refresh() gir oss ferske serverdata som prop, men useState-verdien
  // fryser på førsteverdien. Uten denne synkroniseringen ville «Fortsett
  // generering (del N)» stått med et gammelt N etter en kjøring.
  useEffect(() => {
    setProject(initial);
  }, [initial]);

  const { state, start } = useSpecGeneration();

  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<PriceEstimate | null>(initial.price_estimate);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);

  const [mockupImages, setMockupImages] = useState<string[]>(initial.mockup_images ?? []);
  const [mockupCount, setMockupCount] = useState(6);
  const [generatingMockups, setGeneratingMockups] = useState(false);
  const [mockupProgress, setMockupProgress] = useState<{ index: number; total: number } | null>(null);
  const [mockupError, setMockupError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const generatedParts = state.finished ? totalParts : (project.generated_parts ?? (project.project_md ? 1 : 0));
  const partial = generatedParts > 0 && generatedParts < totalParts;
  const projectMd = state.projectMd ?? project.project_md;

  async function regenerate() {
    await start({ project_id: project.id, regenerate: true });
    router.refresh();
  }

  async function resume() {
    await start({ project_id: project.id, part: generatedParts + 1 });
    router.refresh();
  }

  async function getEstimate() {
    setEstimating(true);
    setEstimateError(null);
    try {
      const res = await fetch("/api/kickstart/estimate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Serverfeil: ${res.status}`);
      setEstimate(data as PriceEstimate);
    } catch (e) {
      setEstimateError((e as Error).message);
    } finally {
      setEstimating(false);
    }
  }

  async function readSse(url: string, body: object, onEvent: (e: Record<string, unknown>) => void) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw new Error(`Serverfeil: ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          onEvent(JSON.parse(line.slice(5).trim()));
        } catch {
          /* ignorer ufullstendig linje */
        }
      }
    }
  }

  async function bootstrap() {
    setBootstrapping(true);
    setBootLog(["Starter bootstrap…"]);
    try {
      await readSse("/api/kickstart/bootstrap", { id: project.id }, (event) => {
        if (event.type === "step") {
          setBootLog((prev) => [...prev, event.message as string]);
        } else if (event.type === "done") {
          const result = event.result as BootstrapResult;
          setProject((p) => ({
            ...p,
            status: "bootstrapped",
            github_repo_url: result.github_repo_url ?? p.github_repo_url,
            supabase_project_ref: result.supabase_project_ref ?? p.supabase_project_ref,
            vercel_project_id: result.vercel_project_id ?? p.vercel_project_id,
          }));
          setBootLog((prev) => [
            ...prev,
            ...(result.errors.length ? result.errors.map((e) => `FEIL: ${e}`) : ["Bootstrap fullført"]),
          ]);
        } else if (event.type === "error") {
          setBootLog((prev) => [...prev, `FEIL: ${event.message as string}`]);
        }
      });
    } catch (e) {
      setBootLog((prev) => [...prev, `FEIL: ${(e as Error).message}`]);
    } finally {
      setBootstrapping(false);
      router.refresh();
    }
  }

  async function generateMockups() {
    setGeneratingMockups(true);
    setMockupError(null);
    setMockupProgress(null);
    setMockupImages([]);
    try {
      await readSse("/api/kickstart/mockup-images", { id: project.id, count: mockupCount }, (event) => {
        if (event.type === "progress") {
          setMockupProgress({ index: event.index as number, total: event.total as number });
        } else if (event.type === "image") {
          setMockupImages((p) => [...p, event.dataUrl as string]);
        } else if (event.type === "image_error") {
          setMockupError((p) =>
            p ? `${p} · Bilde ${event.index}: ${event.message}` : `Bilde ${event.index}: ${event.message}`,
          );
        } else if (event.type === "done") {
          setProject((p) => ({ ...p, mockup_images: event.images as string[] }));
        } else if (event.type === "error") {
          setMockupError(event.message as string);
        }
      });
    } catch (e) {
      setMockupError((e as Error).message);
    } finally {
      setMockupProgress(null);
      setGeneratingMockups(false);
    }
  }

  async function remove() {
    const answer = window.prompt(
      `Sletting kan ikke angres — specen og alt som er generert forsvinner.\n\nSkriv prosjektnavnet for å bekrefte:`,
    );
    if (answer === null) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/kickstart/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, confirm_name: answer }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Serverfeil: ${res.status}`);
      router.push("/admin/kickstart");
      router.refresh();
    } catch (e) {
      setDeleteError((e as Error).message);
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <ProjectEditForm
        project={project}
        onCancel={() => setEditing(false)}
        onSaved={(fields) => {
          setProject((p) => ({ ...p, ...fields }));
          setEditing(false);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Fakta */}
      <section className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <dl className="grid flex-1 grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Info label="Type" value={labelOf(project.project_type, PROJECT_TYPES)} />
            <Info label="Designretning" value={labelOf(project.design_direction, DESIGN_DIRECTIONS)} />
            <Info label="Auth" value={labelOf(project.auth_type, AUTH_OPTIONS)} />
            <Info label="Primærfarge" value={project.primary_color ?? "–"} color={project.primary_color} />
          </dl>
          <button onClick={() => setEditing(true)} className="btn btn-secondary shrink-0">
            Rediger
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-4 border-t border-line pt-4 text-sm sm:grid-cols-2">
          <Info
            label="Teknologier"
            value={(project.tech_stack ?? []).map((t) => labelOf(t, TECH_OPTIONS)).join(", ") || "–"}
          />
          <Info label="Sprinter" value={project.sprint_estimate ? String(project.sprint_estimate) : "–"} />
        </dl>
        {project.short_description && <p className="mt-4 text-sm text-muted">{project.short_description}</p>}
      </section>

      {/* Fremdrift på specen */}
      {partial && !state.running && (
        <div className="card border-warning/40 bg-warning-soft p-4 text-sm">
          <p className="font-medium text-warning">
            Specen er delvis generert — del {generatedParts} av {totalParts}.
          </p>
          <p className="mt-1 text-muted">
            Det som er generert er lagret. «Fortsett generering» tar resten uten å skrive om det som
            allerede står.
          </p>
        </div>
      )}

      {/* Handlinger */}
      <div className="flex flex-wrap gap-2.5">
        {partial && (
          <button onClick={resume} disabled={state.running} className="btn btn-primary">
            {state.running ? "Genererer…" : `Fortsett generering (del ${generatedParts + 1})`}
          </button>
        )}
        <button
          onClick={regenerate}
          disabled={state.running}
          className={partial ? "btn btn-secondary" : "btn btn-primary"}
        >
          {state.running ? "Genererer…" : projectMd ? "Regenerer spec" : "Generer PROJECT.md"}
        </button>

        {projectMd && (
          <>
            <Link href={`/admin/kickstart/${project.id}/preview`} className="btn btn-secondary">
              Les PROJECT.md
            </Link>
            <button onClick={getEstimate} disabled={estimating} className="btn btn-secondary">
              {estimating ? "Estimerer…" : "Prisestimat"}
            </button>
            <button onClick={bootstrap} disabled={bootstrapping} className="btn btn-secondary">
              {bootstrapping ? "Bootstrapper…" : "Bootstrap prosjekt"}
            </button>
          </>
        )}
        <button onClick={remove} disabled={deleting || state.running} className="btn btn-danger ml-auto">
          {deleting ? "Sletter…" : "Slett prosjekt"}
        </button>
      </div>
      {deleteError && (
        <p role="alert" className="text-sm text-danger">
          {deleteError}
        </p>
      )}

      {(state.running || state.log.length > 0) && <GenerationPanel state={state} />}

      {estimateError && (
        <p role="alert" className="text-sm text-danger">
          {estimateError}
        </p>
      )}

      {estimate && (
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Prisestimat</h2>
          <p className="mb-4 text-2xl font-semibold">
            {estimate.total_min.toLocaleString("nb-NO")} – {estimate.total_max.toLocaleString("nb-NO")}{" "}
            {estimate.currency}
          </p>
          <ul className="space-y-2">
            {estimate.breakdown.map((item, i) => (
              <li key={i} className="flex justify-between gap-4 text-sm">
                <span className="text-muted" title={item.description}>
                  {item.label}
                </span>
                <span className="whitespace-nowrap font-medium">
                  {item.hours_min}–{item.hours_max} timer
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">{estimate.notes}</p>
          <p className="mt-2 text-xs text-faint">
            Estimatet er AI-generert og skal kvalitetssikres før det sendes til kunde.
          </p>
        </section>
      )}

      {/* Mockups */}
      {projectMd && (
        <section className="card p-5">
          <h2 className="mb-1 font-semibold">Mockup-bilder</h2>
          <p className="mb-3 text-xs text-muted">
            {project.project_type === "mobile" ? "App-skjermer" : "Nettside-sider"} generert fra
            spec-en — for å sjekke retningen før byggestart.
          </p>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex gap-1.5" role="group" aria-label="Antall bilder">
              {[4, 6, 8, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMockupCount(n)}
                  disabled={generatingMockups}
                  aria-pressed={mockupCount === n}
                  className="choice px-3 py-1.5 text-xs font-medium"
                >
                  {n}
                </button>
              ))}
            </div>
            <button onClick={generateMockups} disabled={generatingMockups} className="btn btn-primary">
              {generatingMockups
                ? `Genererer… ${mockupProgress ? `(${mockupProgress.index}/${mockupProgress.total})` : ""}`
                : mockupImages.length > 0
                  ? "Regenerer mockup-bilder"
                  : "Generer mockup-bilder"}
            </button>
          </div>
          {mockupError && (
            <p role="alert" className="mb-3 text-sm text-danger">
              {mockupError}
            </p>
          )}
          {mockupImages.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {mockupImages.map((src, i) => (
                <li key={i}>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg border border-line hover:border-accent"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, ikke en optimaliserbar remote-URL */}
                    <img src={src} alt={`Mockup ${i + 1} av ${mockupImages.length}`} className="h-auto w-full" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Bootstrap-ressurser */}
      {(project.github_repo_url || project.supabase_project_ref || project.vercel_project_id) && (
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Bootstrap-ressurser</h2>
          <dl className="space-y-2 text-sm">
            {project.github_repo_url && (
              <div>
                <dt className="text-xs text-faint">GitHub</dt>
                <dd>
                  <a
                    href={project.github_repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {project.github_repo_url}
                  </a>
                </dd>
              </div>
            )}
            {project.supabase_project_ref && (
              <div>
                <dt className="text-xs text-faint">Supabase ref</dt>
                <dd className="font-mono text-xs">{project.supabase_project_ref}</dd>
              </div>
            )}
            {project.vercel_project_id && (
              <div>
                <dt className="text-xs text-faint">Vercel ID</dt>
                <dd className="font-mono text-xs">{project.vercel_project_id}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {bootLog.length > 0 && (
        <div className="terminal card overflow-hidden p-4">
          {bootLog.map((l, i) => (
            <div key={i} className={l.startsWith("FEIL:") ? "text-[#ff8079]" : "text-[#a9d7bd]"}>
              {l}
            </div>
          ))}
          {bootLog.some((l) => l.startsWith("DB-passord")) && (
            <p className="mt-3 border-t border-[#1d222c] pt-3 text-[#e6b25c]">
              Passordet over lagres ikke noe sted — kopier det til Doppler nå.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, color }: { label: string; value: string; color?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="mb-0.5 text-xs text-faint">{label}</dt>
      <dd className="flex items-center gap-1.5 text-sm">
        {color && (
          <span aria-hidden className="h-3 w-3 shrink-0 rounded-full ring-1 ring-line" style={{ backgroundColor: color }} />
        )}
        <span className="truncate" title={value}>
          {value}
        </span>
      </dd>
    </div>
  );
}
