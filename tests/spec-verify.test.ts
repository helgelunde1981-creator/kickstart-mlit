import { describe, expect, it } from "vitest";
import { verifyContent } from "@/lib/kickstart/verify";

function fullSpec(): string {
  return (
    "# Spec\n\n## Sprintplan\nSprint 1 …\n\n## Datamodell\nCREATE TABLE kunder ();\nRLS policy …\n\n" +
    "JSON-LD schema.org sitemap\n\nContent-Security-Policy, GDPR og personvern\n\n" +
    "--color-primary i tokens.css\n\nAGENTS.md\n\nPre-launch\n\nE-postmal for kvittering\n\n" +
    "## Spørsmål til kunden\n" +
    "x".repeat(100_001) +
    "."
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

describe("falske positiver i verifiseringen", () => {
  it("regner ikke flettefelt i e-postmaler som ufylte placeholders", () => {
    // Produksjonskjøringen 2026-08-24 ble underkjent på {{Kontaktperson}} og
    // {{Dato}} — som er innhold specen SKAL ha, ikke hull i den.
    const spec = fullSpec() + "\nHei {{Kontaktperson}}, flyttingen skjer {{Dato}} kl. {{Klokkeslett}}.\n";
    const result = verifyContent(spec);

    expect(result.checks.find((c) => c.label.includes("placeholders"))?.ok).toBe(true);
  });

  it("fanger fortsatt malens egne placeholders", () => {
    const result = verifyContent(fullSpec() + "\nKunde: {{client_name}}\n");
    expect(result.checks.find((c) => c.label.includes("placeholders"))?.ok).toBe(false);
  });
});

describe("endsCleanly", () => {
  it("underkjenner en spec som slutter midt i et ord", async () => {
    const { endsCleanly } = await import("@/lib/kickstart/verify");
    // Nøyaktig slik den ekte specen endte.
    expect(endsCleanly("- `npm`, `pnpm` — finnes ikke i d")).toBe(false);
  });

  it("godtar vanlige avslutninger", async () => {
    const { endsCleanly } = await import("@/lib/kickstart/verify");
    expect(endsCleanly("Alt er klart til lansering.")).toBe(true);
    expect(endsCleanly("- [ ] Siste punkt i sjekklista\n")).toBe(true);
    expect(endsCleanly("```\nkode\n```")).toBe(true);
    // Et helt vanlig ord er en gyldig avslutning — første versjon av sjekken
    // underkjente dette, og en falsk positiv gjør at ingen ser på resultatet.
    expect(endsCleanly("Se sprintplanen for detaljer om leveransen")).toBe(true);
  });

  it("underkjenner en spec som ender inne i en åpen kodeblokk", async () => {
    const { endsCleanly } = await import("@/lib/kickstart/verify");
    expect(endsCleanly("Slik gjør du det:\n\n```bash\npnpm install")).toBe(false);
  });
});
