import { siteUrl } from "./base-url";
import { workerAuthHeader } from "./worker-auth";

/**
 * Vercel Deployment Protection (SSO) står på for alt unntatt egendefinerte
 * domener. Treffer selvkallet et beskyttet domene, svarer Vercel med sin egen
 * innloggingsside — ikke appen vår. Er «Protection Bypass for Automation» slått
 * på, gir Vercel oss denne nøkkelen, og headeren slipper kallet gjennom.
 */
function bypassHeader(): Record<string, string> {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  return secret ? { "x-vercel-protection-bypass": secret } : {};
}

/**
 * Sparker i gang neste del. Kallet svarer med en gang (worker-en gjør jobben
 * etter at responsen er sendt), så dette henger ikke.
 *
 * Feiler det, er det ikke kritisk for dataene: jobben blir stående i kø, og
 * cron-vaktposten plukker den opp. Men det er verdt en tydelig logglinje —
 * en kjede som aldri starter ser ellers ut som ingenting.
 */
export async function triggerWorker(jobId: string): Promise<boolean> {
  const url = `${siteUrl()}/api/kickstart/worker`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...workerAuthHeader(), ...bypassHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId }),
      cache: "no-store",
      redirect: "manual",
    });

    if (res.ok) return true;

    // 401/403 fra et Vercel-domene er nesten alltid deployment protection, ikke
    // vår egen autentisering — de to ser like ut i loggen om man ikke sier fra.
    if (res.status === 401 || res.status === 403 || res.status === 307) {
      console.error(
        `[dispatch] Selvkallet til ${url} ble avvist (${res.status}). ` +
          "Er dette et vercel.app-domene, blokkeres det av Deployment Protection: " +
          "sett NEXT_PUBLIC_SITE_URL til det egendefinerte domenet, eller slå på " +
          "Protection Bypass for Automation i Vercel.",
      );
      return false;
    }

    console.error(`[dispatch] Worker svarte ${res.status} for jobb ${jobId}`);
    return false;
  } catch (e) {
    console.error(`[dispatch] Klarte ikke starte worker for jobb ${jobId}: ${(e as Error).message}`);
    return false;
  }
}

/**
 * Sjekker at appen faktisk når seg selv på den URL-en bakgrunnsjobben bruker.
 * Brukes av helsesjekken, slik at en feilkonfigurert selv-URL oppdages med ett
 * klikk i stedet for ved at en generering aldri kommer i gang.
 */
export async function probeSelfUrl(): Promise<{ url: string; reachable: boolean; status: number | null; hint?: string }> {
  const url = siteUrl();
  try {
    const res = await fetch(`${url}/login`, {
      method: "GET",
      headers: bypassHeader(),
      cache: "no-store",
      redirect: "manual",
    });
    const reachable = res.ok;
    return {
      url,
      reachable,
      status: res.status,
      ...(reachable
        ? {}
        : {
            hint:
              "Appen når ikke seg selv på denne URL-en. Er det et vercel.app-domene med " +
              "Deployment Protection på, må NEXT_PUBLIC_SITE_URL peke på det egendefinerte domenet.",
          }),
    };
  } catch (e) {
    return { url, reachable: false, status: null, hint: (e as Error).message };
  }
}
