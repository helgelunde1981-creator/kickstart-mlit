import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProjectEstimate } from "@/lib/kickstart/queries";
import { estimateProjectPrice } from "@/lib/kickstart/estimate-price";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const project = await getProject(id);
  if (!project) return NextResponse.json({ error: "Prosjekt ikke funnet" }, { status: 404 });

  const estimate = await estimateProjectPrice(project);
  await updateProjectEstimate(id, estimate);
  return NextResponse.json(estimate);
}
