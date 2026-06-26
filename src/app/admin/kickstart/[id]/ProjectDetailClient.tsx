"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { KickstartProject, PriceEstimate, BootstrapResult } from "@/lib/kickstart/types";

export default function ProjectDetailClient({ project: initial }: { project: KickstartProject }) {
  const [project, setProject] = useState(initial);
  const [generating, setGenerating] = useState(false);
  const [genLog, setGenLog] = useState<string[]>([]);
  const [liveText, setLiveText] = useState("");
  const [currentPartTitle, setCurrentPartTitle] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [estimate, setEstimate] = useState<PriceEstimate | null>(initial.price_estimate);
  const liveRef = useRef<HTMLPreElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveRef.current) liveRef.current.scrollTop = liveRef.current.scrollHeight;
  }, [liveText]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [genLog]);

  async function generateSpec() {
    setGenerating(true);
    setGenLog(["Starter generering..."]);
    setLiveText("");
    setCurrentPartTitle("");

    let localProjectId: string | null = null;

    async function readStream(fetchBody: object): Promise<"done" | "continue" | "error"> {
      let res: Response;
      try {
        res = await fetch("/api/kickstart/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fetchBody),
        });
      } catch (e) {
        setGenLog((p) => [...p, `❌ Nettverksfeil: ${(e as Error).message}`]);
        return "error";
      }
      if (!res.ok || !res.body) {
        setGenLog((p) => [...p, `❌ Serverfeil: ${res.status}`]);
        return "error";
      }

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
          let event: Record<string, unknown>;
          try { event = JSON.parse(line.slice(5).trim()); } catch { continue; }

          if (event.type === "project_id") {
            localProjectId = event.id as string;
          } else if (event.type === "start_part") {
            setCurrentPartTitle(event.title as string);
            setLiveText("");
            setGenLog((p) => [...p, `Genererer: ${event.title as string}`]);
          } else if (event.type === "delta") {
            setLiveText((p) => p + (event.text as string));
          } else if (event.type === "part") {
            setGenLog((p) => {
              const next = [...p];
              let idx = -1;
              for (let j = next.length - 1; j >= 0; j--) {
                if (next[j].startsWith("Genererer:")) { idx = j; break; }
              }
              if (idx !== -1) next[idx] = `✓ ${event.title as string}`;
              return next;
            });
            setLiveText("");
            setCurrentPartTitle("");
          } else if (event.type === "continue") {
            localProjectId = event.project_id as string;
            setGenLog((p) => [...p, "Del 1 lagret ✓ — starter Del 2 av 2..."]);
            return "continue";
          } else if (event.type === "done") {
            setProject((p) => ({ ...p, project_md: (event as { project_md: string }).project_md, status: "generated" }));
            setGenLog((p) => [...p, "PROJECT.md generert og lagret!"]);
            setLiveText("");
            setCurrentPartTitle("");
            return "done";
          } else if (event.type === "error") {
            setGenLog((p) => [...p, `❌ ${event.message as string}`]);
            return "error";
          }
        }
      }
      return "done";
    }

    try {
      const result1 = await readStream({
        client_name:       project.client_name,
        project_name:      project.project_name,
        contact_person:    project.contact_person ?? "",
        new_domain:        project.new_domain ?? "",
        existing_url:      project.existing_url ?? "",
        project_type:      project.project_type,
        auth_type:         project.auth_type ?? "supabase-auth",
        sprint_estimate:   project.sprint_estimate ?? 6,
        requires_scrape:   project.requires_scrape ?? false,
        tech_stack:        project.tech_stack ?? [],
        integrations:      project.integrations ?? [],
        design_direction:  project.design_direction ?? "",
        primary_color:     project.primary_color ?? "#3B82F6",
        secondary_color:   project.secondary_color ?? "",
        motion_preference: project.motion_preference ?? "subtil",
        features:          project.features ?? "",
        extra_notes:       project.extra_notes ?? "",
        short_description: project.short_description ?? "",
        long_description:  project.long_description ?? "",
      });

      if (result1 === "continue" && localProjectId) {
        await readStream({ project_id: localProjectId });
      }
    } finally {
      setGenerating(false);
    }
  }

  async function getEstimate() {
    setEstimating(true);
    const res = await fetch("/api/kickstart/estimate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id }),
    });
    if (res.ok) setEstimate(await res.json());
    setEstimating(false);
  }

  async function bootstrap() {
    setBootstrapping(true);
    setBootLog(["Starter bootstrap..."]);
    const res = await fetch("/api/kickstart/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id }),
    });

    const reader = res.body!.getReader();
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
        const event = JSON.parse(line.slice(5).trim());
        if (event.type === "step") {
          setBootLog((prev) => [...prev, event.message]);
        } else if (event.type === "done") {
          const result: BootstrapResult = event.result;
          setProject((p) => ({
            ...p,
            status: "bootstrapped",
            github_repo_url: result.github_repo_url ?? p.github_repo_url,
            supabase_project_ref: result.supabase_project_ref ?? p.supabase_project_ref,
            vercel_project_id: result.vercel_project_id ?? p.vercel_project_id,
          }));
          if (result.errors.length) {
            setBootLog((prev) => [...prev, ...result.errors.map((e) => `❌ ${e}`)]);
          } else {
            setBootLog((prev) => [...prev, "✅ Bootstrap fullført!"]);
          }
        } else if (event.type === "error") {
          setBootLog((prev) => [...prev, `❌ ${event.message}`]);
        }
      }
    }
    setBootstrapping(false);
  }

  const hasFailed = genLog.some((l) => l.startsWith("❌"));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Type" value={project.project_type} />
          <Info label="Teknologier" value={project.tech_stack.join(", ")} />
          <Info label="Farge" value={project.primary_color ?? "–"} color={project.primary_color} />
          <Info label="Status" value={project.status} />
        </dl>
        {project.short_description && (
          <p className="mt-3 text-sm text-gray-600">{project.short_description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={generateSpec}
          disabled={generating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? "Genererer..." : project.project_md ? "Regenerer spec" : "Generer PROJECT.md"}
        </button>
        {project.project_md && (
          <>
            <Link
              href={`/admin/kickstart/${project.id}/preview`}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Se PROJECT.md
            </Link>
            <button
              onClick={getEstimate}
              disabled={estimating}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {estimating ? "Estimerer..." : "Prisestimat"}
            </button>
            <button
              onClick={bootstrap}
              disabled={bootstrapping}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {bootstrapping ? "Bootstrapper..." : "Bootstrap prosjekt"}
            </button>
          </>
        )}
      </div>

      {genLog.length > 0 && (
        <div className="bg-gray-950 rounded-xl overflow-hidden">
          {currentPartTitle && (
            <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-400 font-mono truncate">
              {currentPartTitle}
            </div>
          )}
          <div ref={logRef} className="px-4 py-3 font-mono text-xs space-y-0.5 max-h-40 overflow-y-auto">
            {genLog.map((l, i) => (
              <div key={i} className={
                l.startsWith("✓") ? "text-green-400"
                : l.startsWith("❌") ? "text-red-400"
                : l.startsWith("PROJECT.md") ? "text-green-300 font-bold"
                : l.startsWith("Genererer:") ? "text-blue-400"
                : "text-gray-400"
              }>
                {l.startsWith("Genererer:") ? `▶ ${l.replace("Genererer: ", "")}` : l}
              </div>
            ))}
            {!hasFailed && generating && <div className="text-blue-400 animate-pulse">▋</div>}
          </div>
          {liveText && (
            <pre
              ref={liveRef}
              className="border-t border-gray-800 px-4 py-3 font-mono text-xs text-green-300 leading-relaxed overflow-y-auto max-h-72 whitespace-pre-wrap break-words"
            >
              {liveText}
            </pre>
          )}
        </div>
      )}

      {estimate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Prisestimat</h2>
          <div className="text-2xl font-bold text-gray-900 mb-4">
            {estimate.total_min.toLocaleString("nb-NO")} – {estimate.total_max.toLocaleString("nb-NO")} {estimate.currency}
          </div>
          <div className="space-y-2">
            {estimate.breakdown.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="text-gray-900 font-medium">{item.hours_min}–{item.hours_max} timer</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">{estimate.notes}</p>
        </div>
      )}

      {(project.github_repo_url || project.supabase_project_ref || project.vercel_project_id) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Bootstrap-ressurser</h2>
          <div className="space-y-2 text-sm">
            {project.github_repo_url && (
              <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer"
                className="block text-blue-600 hover:underline">
                GitHub: {project.github_repo_url}
              </a>
            )}
            {project.supabase_project_ref && (
              <p className="text-gray-600">Supabase ref: {project.supabase_project_ref}</p>
            )}
            {project.vercel_project_id && (
              <p className="text-gray-600">Vercel ID: {project.vercel_project_id}</p>
            )}
          </div>
        </div>
      )}

      {bootLog.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 space-y-1">
          {bootLog.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, color }: { label: string; value: string; color?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 flex items-center gap-1.5">
        {color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />}
        {value}
      </dd>
    </div>
  );
}
