import Link from "next/link";
import type { Metadata } from "next";
import { listProjects } from "@/lib/kickstart/queries";
import ProjectList, { ProjectRow } from "@/components/kickstart/ProjectList";
import { TOTAL_PARTS } from "@/lib/kickstart/generate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Prosjekter" };

/** Formateres på serveren med fast tidssone — ellers spriker server og klient. */
function formatNorwegianTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("nb-NO", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo",
  });
  const time = d.toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo",
  });
  return `${date} kl. ${time}`;
}

export default async function KickstartListPage() {
  let rows: ProjectRow[];
  try {
    const projects = await listProjects();
    rows = projects.map((p) => ({
      id: p.id,
      project_name: p.project_name,
      client_name: p.client_name,
      short_description: p.short_description,
      status: p.status,
      primary_color: p.primary_color,
      created_at: p.created_at,
      created_at_label: formatNorwegianTime(p.created_at),
      generated_parts: p.generated_parts ?? 0,
      total_parts: TOTAL_PARTS,
    }));
  } catch (e) {
    return (
      <div className="card p-6">
        <h1 className="mb-2 text-lg font-semibold">Kunne ikke laste prosjekter</h1>
        <p className="text-sm text-muted">
          Databasen svarte ikke: {(e as Error).message}
        </p>
        <p className="mt-3 text-sm text-muted">
          Sjekk <code className="font-mono text-xs">/api/kickstart/health</code> for hvilke
          miljøvariabler som mangler.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Kickstart-prosjekter</h1>
          <p className="text-sm text-muted">
            {rows.length === 0
              ? "Ingen prosjekter ennå"
              : `${rows.length} ${rows.length === 1 ? "prosjekt" : "prosjekter"}`}
          </p>
        </div>
        <Link href="/admin/kickstart/ny" className="btn btn-primary">
          Nytt prosjekt
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="mb-1 font-medium">Ingen prosjekter ennå</p>
          <p className="mb-5 text-sm text-muted">
            Et prosjekt tar deg gjennom ni steg og ender i en komplett PROJECT.md.
          </p>
          <Link href="/admin/kickstart/ny" className="btn btn-primary">
            Opprett ditt første prosjekt
          </Link>
        </div>
      ) : (
        <ProjectList projects={rows} />
      )}
    </>
  );
}
