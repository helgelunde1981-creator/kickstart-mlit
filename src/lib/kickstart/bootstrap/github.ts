const GITHUB_API = "https://api.github.com";

function token(): string {
  const value = process.env.BOOTSTRAP_GITHUB_TOKEN;
  if (!value) throw new Error("BOOTSTRAP_GITHUB_TOKEN mangler i miljøet");
  return value;
}

function owner(): string {
  return process.env.BOOTSTRAP_GITHUB_OWNER || "helgelunde1981-creator";
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${token()}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

export function repoSlug(projectName: string): string {
  const slug = projectName
    .toLowerCase()
    .replace(/[æå]/g, "a")
    .replace(/ø/g, "o")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) throw new Error(`Klarte ikke lage repo-navn av "${projectName}"`);
  return slug;
}

/** GitHub svarer med JSON-feil og status 200-ish i noen tilfeller — les alltid kroppen. */
async function githubError(res: Response, context: string): Promise<Error> {
  const text = await res.text();
  let message = text.slice(0, 300);
  try {
    const json = JSON.parse(text) as { message?: string; errors?: { message?: string }[] };
    message = [json.message, ...(json.errors ?? []).map((e) => e.message)].filter(Boolean).join(" — ");
  } catch {
    /* behold rå tekst */
  }
  return new Error(`${context} (HTTP ${res.status}): ${message}`);
}

export interface RepoFile {
  path: string;
  content: string;
}

export async function createGitHubRepo(
  projectName: string,
  description: string,
  files: RepoFile[],
): Promise<string> {
  const repoName = repoSlug(projectName);

  const createRes = await fetch(`${GITHUB_API}/user/repos`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name: repoName, description, private: true, auto_init: true }),
  });

  let htmlUrl: string;
  if (createRes.ok) {
    htmlUrl = ((await createRes.json()) as { html_url: string }).html_url;
  } else if (createRes.status === 422) {
    // Repoet finnes allerede — bruk det framfor å stoppe hele bootstrappen.
    const existing = await fetch(`${GITHUB_API}/repos/${owner()}/${repoName}`, { headers: headers() });
    if (!existing.ok) throw await githubError(createRes, "GitHub repo-oppretting feilet");
    htmlUrl = ((await existing.json()) as { html_url: string }).html_url;
  } else {
    throw await githubError(createRes, "GitHub repo-oppretting feilet");
  }

  for (const file of files) {
    await putFile(owner(), repoName, file);
  }
  return htmlUrl;
}

export async function updateProjectMdInGitHub(repoUrl: string, projectMd: string): Promise<void> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error(`Klarte ikke lese eier/repo ut av "${repoUrl}"`);
  const [, repoOwner, repo] = match;
  await putFile(repoOwner, repo.replace(/\.git$/, ""), { path: "PROJECT.md", content: projectMd });
}

/**
 * Skriver (eller oppdaterer) én fil. Tidligere ble responsen på PUT ignorert —
 * en feilet push så nøyaktig ut som en vellykket i loggen.
 */
async function putFile(repoOwner: string, repo: string, file: RepoFile): Promise<void> {
  const url = `${GITHUB_API}/repos/${repoOwner}/${repo}/contents/${file.path}`;

  // auto_init tar et lite øyeblikk før default-branchen finnes.
  await new Promise((r) => setTimeout(r, 1200));

  const getRes = await fetch(url, { headers: headers() });
  let sha: string | undefined;
  if (getRes.ok) {
    sha = ((await getRes.json()) as { sha?: string }).sha;
  } else if (getRes.status !== 404) {
    throw await githubError(getRes, `Kunne ikke lese ${file.path} fra GitHub`);
  }

  const putRes = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({
      message: sha ? `chore: oppdater ${file.path} fra kickstart-mlit` : `chore: legg til ${file.path} fra kickstart-mlit`,
      content: Buffer.from(file.content, "utf-8").toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!putRes.ok) throw await githubError(putRes, `Kunne ikke skrive ${file.path} til GitHub`);
}
