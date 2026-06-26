export async function createGitHubRepo(
  projectName: string,
  description: string,
  projectMd: string
): Promise<string> {
  const token = process.env.BOOTSTRAP_GITHUB_TOKEN!;
  const owner = "helgelunde1981-creator";
  const repoName = projectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const createRes = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      description,
      private: true,
      auto_init: true,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(`GitHub repo-oppretting feilet: ${err.message}`);
  }

  const repo = await createRes.json();

  await addFileToRepo(token, owner, repoName, "PROJECT.md", projectMd);

  return repo.html_url;
}

async function addFileToRepo(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string
): Promise<void> {
  await new Promise((r) => setTimeout(r, 1500));

  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });

  let sha: string | undefined;
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "chore: add PROJECT.md from kickstart-mlit",
      content: Buffer.from(content).toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
}
