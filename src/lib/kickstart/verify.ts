import { VerifyCheck } from "./types";

/**
 * Sjekker at det faktisk står noe i specen — ikke bare at genereringen svarte.
 * Grensene er grove, men de fanger den vanlige feilen: en del som stoppet etter
 * tre avsnitt fordi modellen ble avbrutt.
 */
export function verifyContent(md: string): { ok: boolean; checks: VerifyCheck[] } {
  const placeholders = md.match(/\{\{[a-z_]+\}\}|\bTBD\b|\[\.\.\.\]/gi) ?? [];
  const checks: VerifyCheck[] = [
    { label: "Full spec (>100 000 tegn)",  ok: md.length > 100_000 },
    { label: "Sprintplan",                 ok: /sprint[\s-]?plan|sprintplan|sprint\s+\d/i.test(md) },
    { label: "Datamodell / SQL",           ok: /create table|datamodell|rls|policy/i.test(md) },
    { label: "SEO + AEO",                  ok: /json-ld|schema\.org|sitemap/i.test(md) },
    { label: "Sikkerhet + GDPR",           ok: /content-security-policy|csp|gdpr|personvern/i.test(md) },
    { label: "Designsystem (tokens)",      ok: /--color|tokens\.css|designtokens|designsystem/i.test(md) },
    { label: "AGENTS.md",                  ok: /AGENTS\.md/i.test(md) },
    { label: "Pre-launch-sjekkliste",      ok: /pre.?launch/i.test(md) },
    { label: "E-postmaler",                ok: /e-postmal|epostmal|transaksjons/i.test(md) },
    { label: "Spørsmål til kunden",        ok: /spørsmål til kunden/i.test(md) },
    { label: "Ingen ufylte placeholders",  ok: placeholders.length === 0 },
  ];
  return { ok: checks.every((c) => c.ok), checks };
}
