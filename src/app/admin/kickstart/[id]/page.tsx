import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/kickstart/queries";
import ProjectDetailClient from "./ProjectDetailClient";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/kickstart" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Tilbake
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{project.project_name}</h1>
        <span className="text-gray-400">·</span>
        <span className="text-gray-500">{project.client_name}</span>
      </div>
      <ProjectDetailClient project={project} />
    </div>
  );
}
