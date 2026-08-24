import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProject } from "@/lib/kickstart/queries";
import { renderMarkdown } from "@/lib/markdown";
import SpecActions from "@/components/kickstart/SpecActions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project ? `PROJECT.md — ${project.project_name}` : "PROJECT.md" };
}

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project || !project.project_md) notFound();

  const { html, headings } = renderMarkdown(project.project_md);
  const words = project.project_md.trim().split(/\s+/).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/admin/kickstart/${id}`} className="text-sm text-muted hover:text-fg">
            ← {project.project_name}
          </Link>
          <h1 className="text-xl font-semibold">PROJECT.md</h1>
          <p className="text-xs text-faint">
            {project.project_md.length.toLocaleString("nb-NO")} tegn · ca.{" "}
            {words.toLocaleString("nb-NO")} ord
          </p>
        </div>
        <SpecActions markdown={project.project_md} fileName={`${project.project_name}-PROJECT.md`} />
      </div>

      <div className="gap-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* Innholdsfortegnelse — 100 000 tegn uten navigasjon er ikke lesbart. */}
        <nav aria-label="Innhold" className="mb-5 lg:mb-0">
          <div className="card max-h-[calc(100vh-8rem)] overflow-y-auto p-3 lg:sticky lg:top-20">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-faint">Innhold</p>
            <ul className="space-y-0.5 text-sm">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className={`block truncate rounded px-1.5 py-1 hover:bg-surface-2 ${
                      h.level === 1 ? "font-medium" : h.level === 2 ? "pl-3 text-muted" : "pl-5 text-xs text-faint"
                    }`}
                    title={h.text}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <article
          className="card markdown min-w-0 p-6 sm:p-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
