# 0002 — Claude Opus 5 med prompt caching for spec-generering

**Status:** Vedtatt
**Dato:** 2026-08-24

## Kontekst

Modell-ID-en `claude-sonnet-4-6` var hardkodet i to filer. Hver av de 12 delene
sender med hele standardsettet fra `docs/standards/` (~40 000 tokens) pluss alt
som allerede er skrevet i specen — uten `cache_control` betalte vi full pris for
det samme prefikset tolv ganger.

Specen er selve varen vi selger. Kvaliteten på den bestemmer kvaliteten på alt
som bygges etterpå.

## Alternativer

| Alternativ | For | Mot |
|---|---|---|
| Bli på Sonnet uten caching | Ingen endring | Betaler for samme kontekst 12 ganger; svakere modell på det viktigste vi lager |
| Opus 5 uten caching | Beste kvalitet | Unødvendig dyrt |
| Opus 5 + prompt caching, ett sted for modell-ID | Beste kvalitet, cachet prefiks leses for en brøkdel | Cachen ryker hvis vi endrer noe tidlig i prompten |

## Beslutning

`src/lib/kickstart/model.ts` er eneste sted en modell-ID står. Standard er
`claude-opus-5`, overstyrbar med `ANTHROPIC_MODEL` i Doppler, og systemprompt,
standardsett og allerede generert innhold merkes med
`cache_control: { type: "ephemeral", ttl: "1h" }` — fordi den beste modellen på
vår viktigste leveranse blir betalbar når det samme prefikset ikke betales
tolv ganger.

`max_tokens` per del er hevet fra 8 500 til 32 000 (streaming, så det koster kun
det modellen faktisk bruker), og hver del prøves på nytt inntil tre ganger ved
429/5xx.

## Konsekvenser

**Dette gir oss:** Bedre spec, lavere kostnad per kjøring enn en naiv Opus-bruk,
og ett sted å bytte modell.

**Dette koster oss:** Høyere pris per ucachet token enn Sonnet. En delvis
generering som gjenopptas mer enn en time senere treffer ikke cachen.

**Dette må vi passe på:** Cachen er et prefiks-treff. Endrer man rekkefølgen på
prompt-delene, eller putter noe variabelt (tidsstempel, ID) tidlig i den, ryker
alt etterpå stille. `cached_input_tokens` logges per del — er den 0 over tid, er
det en feil, ikke en tilfeldighet.

## Når bør dette tas opp igjen

Ved ny modellgenerasjon, eller hvis kostnaden per spec blir et reelt problem —
da er `ANTHROPIC_MODEL` allerede bryteren.
