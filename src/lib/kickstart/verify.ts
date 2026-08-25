import { VerifyCheck } from "./types";

/**
 * Ble teksten kuttet midt i noe? Specen fra 2026-08-24 sluttet med «finnes ikke
 * i d» fordi siste del traff token-taket.
 *
 * Første forsøk sjekket siste tegn mot en liste over «lovlige» avslutninger,
 * men da ble en spec som ender på et helt vanlig ord underkjent. Her er kun to
 * signaler som ikke kan bety noe annet enn et kutt:
 *
 * 1. Teksten ender på et løsrevet enkelt-tegn etter mellomrom («… i d»).
 * 2. Teksten ender inne i en kodeblokk som aldri ble lukket.
 */
export function endsCleanly(md: string): boolean {
  const tekst = md.trimEnd();
  if (/(?:^|\s)\S$/.test(tekst)) return false;

  const kodemarkorer = (tekst.match(/^```/gm) ?? []).length;
  return kodemarkorer % 2 === 0;
}

/**
 * Sjekker at det faktisk står noe i specen — ikke bare at genereringen svarte.
 * Grensene er grove, men de fanger den vanlige feilen: en del som stoppet etter
 * tre avsnitt fordi modellen ble avbrutt.
 */
export function verifyContent(md: string): { ok: boolean; checks: VerifyCheck[] } {
  // Malens egne placeholders er snake_case med små bokstaver ({{client_name}}).
  // Case-insensitiv matching slo ut på {{Kontaktperson}} og {{Dato}} — som er
  // flettefelt i e-postmalene specen SKAL inneholde. Én falsk positiv gjør at
  // hele verifiseringen blir noe man overser.
  const placeholders = [
    ...(md.match(/\{\{[a-z][a-z0-9_]*\}\}/g) ?? []),
    ...(md.match(/\bTBD\b/g) ?? []),
    ...(md.match(/\[\.\.\.\]/g) ?? []),
  ];
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
    // Modellen har truffet token-taket hvis siste tegn ikke avslutter noe.
    { label: "Avsluttet ordentlig",        ok: endsCleanly(md) },
  ];
  return { ok: checks.every((c) => c.ok), checks };
}
