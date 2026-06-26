"use client";
import { useState } from "react";
import Link from "next/link";
import { KickstartProject, PriceEstimate, BootstrapResult } from "@/lib/kickstart/types";

export default function ProjectDetailClient({ project: initial }: { project: KickstartProject }) {
  const [project, setProject] = useState(initial);
  const [generating, setGenerating] = useState(false);
  const [genLog, setGenLog] = useState<string[]>([]);
  const [estimating, setEstimating] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [estimate, setEstimate] = useState<PriceEstimate | null>(initial.price_estimate);

  async function generateSpec() {
    setGenerating(true);
    setGenLog(["Starter generering..."]);
    const res = await fetch("/api/kickstart/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: project.client_name,
        project_name: project.project_name,
        project_type: project.project_type,
        tech_stack: project.tech_stack,
        primary_color: project.primary_color ?? "",
        short_description: project.short_description ?? "",
        long_description: project.long_description ?? "",
      }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullMd = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const event = JSON.parse(line.slice(5).trim());
        if (event.type === "part") {
          setGenLog((prev) => [...prev, `✓ ${event.title}`]);
          fullMd += (fullMd ? "\n\n---\n\n" : "") + event.content;
        } else if (event.type === "done") {
          setProject((p) => ({ ...p, project_md: fullMd, status: "generated" }));
          setGenLog((prev) => [...prev, "✅ PROJECT.md generert og lagret"]);
        } else if (event.type === "error") {
          setGenLog((prev) => [...prev, `❌ ${event.message}`]);
        }
      }
    }
    setGenerating(false);
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
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 space-y-1">
          {genLog.map((l, i) => <div key={i}>{l}</div>)}
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
