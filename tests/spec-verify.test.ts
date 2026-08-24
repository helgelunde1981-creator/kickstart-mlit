import { describe, expect, it } from "vitest";
import { verifyContent } from "@/app/api/kickstart/stream/route";

function fullSpec(): string {
  return (
    "# Spec\n\n## Sprintplan\nSprint 1 …\n\n## Datamodell\nCREATE TABLE kunder ();\nRLS policy …\n\n" +
    "JSON-LD schema.org sitemap\n\nContent-Security-Policy, GDPR og personvern\n\n" +
    "--color-primary i tokens.css\n\nAGENTS.md\n\nPre-launch\n\nE-postmal for kvittering\n\n" +
    "## Spørsmål til kunden\n" +
    "x".repeat(100_001)
  );
}

describe("verifyContent", () => {
  it("godkjenner en komplett spec", () => {
    const result = verifyContent(fullSpec());
    expect(result.checks.filter((c) => !c.ok)).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("fanger opp ufylte placeholders", () => {
    const result = verifyContent(fullSpec() + "\nKunde: {{client_name}}\n");
    expect(result.ok).toBe(false);
    expect(result.checks.find((c) => c.label.includes("placeholders"))?.ok).toBe(false);
  });

  it("underkjenner en spec som stoppet tidlig", () => {
    const result = verifyContent("# Spec\nBare litt tekst.");
    expect(result.ok).toBe(false);
  });
});
