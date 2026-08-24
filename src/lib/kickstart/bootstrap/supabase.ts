import { randomBytes } from "crypto";

export interface SupabaseBootstrap {
  ref: string;
  /**
   * Databasepassordet vises ÉN gang i bootstrap-loggen og lagres bevisst ikke i
   * kickstart-databasen. Tidligere ble det generert og kastet — prosjektet ble
   * opprettet med et passord ingen hadde.
   */
  dbPassword: string;
}

export async function createSupabaseProject(
  projectName: string,
  region = "eu-central-1"
): Promise<SupabaseBootstrap> {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const orgId = process.env.SUPABASE_ORG_ID;
  if (!token) throw new Error("SUPABASE_MANAGEMENT_TOKEN mangler i miljøet");
  if (!orgId) throw new Error("SUPABASE_ORG_ID mangler i miljøet");

  const dbPassword = generatePassword();
  const slug = projectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const res = await fetch("https://api.supabase.com/v1/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: slug,
      organization_id: orgId,
      db_pass: dbPassword,
      region,
      plan: "free",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase prosjektoppretting feilet (HTTP ${res.status}): ${err.slice(0, 300)}`);
  }

  const project = (await res.json()) as { id: string };
  return { ref: project.id, dbPassword };
}

/**
 * crypto.randomBytes, ikke Math.random — dette passordet beskytter en
 * produksjonsdatabase.
 */
function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  const bytes = randomBytes(32);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
