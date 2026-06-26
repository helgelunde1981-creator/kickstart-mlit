import Link from "next/link";
import { listProjects } from "@/lib/kickstart/queries";
import { KickstartProject } from "@/lib/kickstart/types";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Utkast",
  generated: "Generert",
  bootstrapped: "Bootstrapped",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  generated: "bg-blue-100 text-blue-800",
  bootstrapped: "bg-green-100 text-green-800",
};

function formatNorwegianTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${date} kl. ${time}`;
}

export default async function KickstartListPage() {
  let projects: KickstartProject[] = [];
  try {
    projects = await listProjects();
  } catch {
    return <div className="text-red-500">Kunne ikke laste prosjekter</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kickstart-prosjekter</h1>
        <Link
          href="/admin/kickstart/ny"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Nytt prosjekt
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">Ingen prosjekter ennå</p>
          <Link
            href="/admin/kickstart/ny"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Opprett ditt første prosjekt
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, idx) => (
            <Link
              key={p.id}
              href={`/admin/kickstart/${p.id}`}
              className={`block bg-white border rounded-xl p-4 hover:shadow-sm transition-all
                ${idx === 0 ? "border-blue-400 ring-1 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {idx === 0 && (
                      <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        SIST
                      </span>
                    )}
                    {p.primary_color && (
                      <span
                        className="w-3 h-3 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: p.primary_color }}
                      />
                    )}
                    <span className="font-medium text-gray-900">{p.project_name}</span>
                    <span className="text-gray-400 text-sm">·</span>
                    <span className="text-gray-500 text-sm">{p.client_name}</span>
                  </div>
                  {p.short_description && (
                    <p className="text-sm text-gray-500 truncate">{p.short_description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatNorwegianTime(p.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
