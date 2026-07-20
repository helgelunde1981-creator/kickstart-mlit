import { NextRequest, NextResponse } from "next/server";
import { updateProjectFields, ProjectEditableFields } from "@/lib/kickstart/queries";

// Gated av proxy.ts sin admin_session-cookie-sjekk (matcher /api/kickstart/:path*).
// Lar Helge justere tech-stack/integrasjoner/designretning/farger på et
// eksisterende prosjekt — dekker "berik prosjekt"-hullet der f.eks. et
// LeadRadar-generert prosjekt kom inn med tomme/default-verdier og trenger
// et menneske til å fylle inn resten før (re)generering.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | ({ id?: string } & ProjectEditableFields)
    | null;
  if (!body?.id) {
    return NextResponse.json({ error: "id er påkrevd" }, { status: 400 });
  }

  const { id, ...fields } = body;

  try {
    await updateProjectFields(id, fields);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
