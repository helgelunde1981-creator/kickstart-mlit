# 0001 — Signert admin-sesjon i stedet for fast cookie-verdi

**Status:** Vedtatt
**Dato:** 2026-08-24

## Kontekst

Innloggingen satte cookien `admin_session=authenticated`, og `proxy.ts` slapp
inn alle som hadde nettopp den strengen. Verdien var konstant, kjent og ikke
knyttet til noe hemmelig: hvem som helst kunne åpne devtools på
`kickstart.mlit.no`, sette cookien manuelt og få full tilgang til admin — med
kundedata, prisestimater og knappen som oppretter GitHub-, Supabase- og
Vercel-ressurser. Passordsjekken var i praksis dekorasjon.

I tillegg ble e-post og passord sammenlignet med `!==`, uten noen brems på
antall forsøk.

## Alternativer

| Alternativ | For | Mot |
|---|---|---|
| Signert cookie (HMAC-SHA256 av utstedelsestidspunkt) | Ingen nye avhengigheter, virker i både Edge og Node, verdien kan ikke forfalskes uten nøkkelen | Vi håndterer signering selv |
| Supabase Auth for admin-brukeren | Ferdig løsning, MFA mulig senere | Ny brukertabell og innloggingsflyt for én bruker |
| `iron-session` / `next-auth` | Modent, mye funksjonalitet | Ny avhengighet og konfigurasjon for ett passordfelt |

## Beslutning

Cookien inneholder nå `<utstedt-ms>.<hmac>`, signert med WebCrypto over
`ADMIN_SESSION_SECRET` (eller `ADMIN_PASSWORD` hvis den ikke er satt), og
verifiseres i `proxy.ts` ved hver forespørsel — fordi en tilgangssjekk som kan
gjenskapes fra klientsiden ikke er en tilgangssjekk.

Samtidig: konstant-tid-sammenligning av e-post og passord, og maks fem
mislykkede forsøk per IP per 15 minutter.

## Konsekvenser

**Dette gir oss:** Forfalskning krever nøkkelen. Sesjoner utløper etter sju
dager, håndhevet server-side. Bytte av `ADMIN_PASSWORD` invaliderer alle
sesjoner umiddelbart.

**Dette koster oss:** Alle blir logget ut ved første deploy. Brute-force-brempen
er per lambda-instans (in-memory), altså «best effort» — den stopper et enkelt
skript, ikke en distribuert kampanje.

**Dette må vi passe på:** `ADMIN_SESSION_SECRET` bør settes i Doppler når vi
ikke lenger vil at passordbytte skal logge ut. Nøkkelen må aldri havne i en
klientkomponent.

## Når bør dette tas opp igjen

Hvis flere enn Helge skal ha tilgang, eller vi trenger MFA/rollestyring — da er
Supabase Auth riktig svar, ikke en større hjemmesnekret sesjonsmodul.
