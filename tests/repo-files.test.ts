import { describe, expect, it } from "vitest";
import { buildAgentsMd, buildRepoReadme } from "@/lib/kickstart/bootstrap/repo-files";
import type { KickstartProject } from "@/lib/kickstart/types";

const prosjekt = {
  project_name: "Ørje Bygg & Anlegg",
  client_name: "Ørje Bygg AS",
  project_type: "webApp",
  design_direction: "03-swiss-minimal-refined",
  tech_stack: [],
  short_description: "Nettside",
  new_domain: null,
} as unknown as KickstartProject;

describe("buildAgentsMd", () => {
  const md = buildAgentsMd(prosjekt);

  it("gjør Linear til planen", () => {
    expect(md).toContain("## Linear er planen");
    expect(md).toContain("helgelunde1981/<nøkkel>-<nr>-…");
    expect(md).toContain("ikke i `docs/plans/` eller GitHub Issues");
  });

  it("har Doppler-kommando med prosjektets eget navn", () => {
    expect(md).toContain("`doppler run -p orje-bygg-anlegg -c dev -- pnpm dev`");
    expect(md).not.toContain(".env.local");
  });

  it("tar med Helges faste arbeidsregler", () => {
    for (const regel of [
      "**Spør før produksjon:**",
      "`git log origin/dev..origin/main` skal være tom",
      "skillen `sikkerhet`",
      "**Fjernstyring:**",
      "`cancel-in-progress`",
      "alternativer og en anbefaling",
      "worktrees",
      "**Slipp i etapper:**",
    ]) {
      expect(md).toContain(regel);
    }
  });

  it("krever verifisering før ferdig", () => {
    expect(md).toContain("ingen tekst kuttet");
    expect(md).toContain("`gh pr checks`");
    expect(md).toContain("`mfa_required`");
  });

  it("har ingen rå backslash fra template-literalen", () => {
    expect(md).not.toContain("\\`");
  });
});

describe("buildRepoReadme", () => {
  it("starter dev-serveren via Doppler", () => {
    expect(buildRepoReadme(prosjekt)).toContain("doppler run -p orje-bygg-anlegg -c dev -- pnpm dev");
  });
});
