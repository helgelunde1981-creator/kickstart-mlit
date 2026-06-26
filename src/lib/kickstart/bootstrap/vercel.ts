export async function createVercelProject(
  projectName: string,
  githubRepoUrl?: string
): Promise<string> {
  const token = process.env.VERCEL_TOKEN!;
  const teamId = process.env.VERCEL_TEAM_ID!;

  const slug = projectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const body: Record<string, unknown> = {
    name: slug,
    framework: "nextjs",
  };

  if (githubRepoUrl) {
    const match = githubRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      body.gitRepository = {
        type: "github",
        repo: `${match[1]}/${match[2]}`,
      };
    }
  }

  const res = await fetch(`https://api.vercel.com/v10/projects?teamId=${teamId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Vercel prosjektoppretting feilet: ${err.error?.message ?? JSON.stringify(err)}`);
  }

  const project = await res.json();
  return project.id;
}
