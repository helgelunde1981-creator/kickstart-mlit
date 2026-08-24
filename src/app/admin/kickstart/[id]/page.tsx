import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject } from "@/lib/kickstart/queries";
import { TOTAL_PARTS } from "@/lib/kickstart/generate";
import ProjectDetailClient from "./ProjectDetailClient";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  return { title: project?.project_name ?? "Prosjekt" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/kickstart" className="text-sm text-muted hover:text-fg">
          ← Prosjekter
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold">{project.project_name}</h1>
          <span className={`badge ${STATUS_STYLES[project.status] ?? "bg-surface-2 text-muted"}`}>
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
        </div>
        <p className="text-sm text-muted">{project.client_name}</p>
      </div>
      <ProjectDetailClient project={project} totalParts={TOTAL_PARTS} />
    </>
  );
}
