import { NextResponse } from "next/server";
import { getPriorColors } from "@/lib/kickstart/prior-colors";

export async function GET() {
  const colors = await getPriorColors();
  return NextResponse.json(colors);
}
