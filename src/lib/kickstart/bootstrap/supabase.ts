export async function createSupabaseProject(
  projectName: string,
  region = "eu-central-1"
): Promise<string> {
  const token = process.env.SUPABASE_MANAGEMENT_TOKEN!;
  const orgId = process.env.SUPABASE_ORG_ID!;

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
    const err = await res.json();
    throw new Error(`Supabase prosjektoppretting feilet: ${JSON.stringify(err)}`);
  }

  const project = await res.json();
  return project.id;
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
