import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/lib/kickstart/queries";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project || !project.project_md) notFound();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/admin/kickstart/${id}`} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Tilbake
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
          {project.project_md}
        </pre>
      </div>
    </div>
  );
}
