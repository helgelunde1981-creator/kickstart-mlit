import { TechOption, DesignDirection } from "./types";

export const TECH_OPTIONS: TechOption[] = [
  // Frontend
  { id: "nextjs",    label: "Next.js",        category: "Frontend" },
  { id: "react",     label: "React",          category: "Frontend" },
  { id: "vue",       label: "Vue.js",         category: "Frontend" },
  { id: "svelte",    label: "SvelteKit",      category: "Frontend" },
  { id: "astro",     label: "Astro",          category: "Frontend" },
  // Styling
  { id: "tailwind",  label: "Tailwind CSS",   category: "Styling" },
  { id: "shadcn",    label: "shadcn/ui",      category: "Styling" },
  // Animasjon
  { id: "framer",    label: "Framer Motion",  category: "Animasjon" },
  // Backend
  { id: "nodejs",    label: "Node.js",        category: "Backend" },
  { id: "fastapi",   label: "FastAPI",        category: "Backend" },
  { id: "nestjs",    label: "NestJS",         category: "Backend" },
  // Database
  { id: "supabase",  label: "Supabase",       category: "Database" },
  { id: "postgres",  label: "PostgreSQL",     category: "Database" },
  { id: "prisma",    label: "Prisma ORM",     category: "Database" },
  { id: "mongodb",   label: "MongoDB",        category: "Database" },
  // Auth
  { id: "supabase-auth", label: "Supabase Auth", category: "Auth" },
  { id: "nextauth",  label: "NextAuth.js",    category: "Auth" },
  { id: "clerk",     label: "Clerk",          category: "Auth" },
  // Hosting / VCS
  { id: "vercel",    label: "Vercel",         category: "Hosting" },
  { id: "github",    label: "GitHub",         category: "Hosting" },
  { id: "fly",       label: "Fly.io",         category: "Hosting" },
  { id: "railway",   label: "Railway",        category: "Hosting" },
  // Språk
  { id: "typescript", label: "TypeScript",   category: "Språk" },
  // E-post
  { id: "resend",    label: "Resend",         category: "E-post" },
  // Storage
  { id: "uploadthing", label: "UploadThing", category: "Storage" },
  // AI
  { id: "anthropic", label: "Anthropic Claude", category: "AI" },
  { id: "openai",    label: "OpenAI",        category: "AI" },
];

export const INTEGRATION_OPTIONS: TechOption[] = [
  { id: "stripe",       label: "Stripe",               category: "Betaling", description: "Internasjonal kortbetaling" },
  { id: "vipps",        label: "Vipps",                category: "Betaling", description: "Norsk mobilbetaling" },
  { id: "klarna",       label: "Klarna",               category: "Betaling", description: "Del opp betaling" },
  { id: "google-maps",  label: "Google Maps",          category: "Kart",     description: "Kart og adressesøk" },
  { id: "sentry",       label: "Sentry",               category: "Monitoring", description: "Error tracking" },
  { id: "plausible",    label: "Plausible Analytics",  category: "Analytics",  description: "Personvernvennlig analyse" },
  { id: "posthog",      label: "PostHog",              category: "Analytics",  description: "Product analytics + replays" },
  { id: "ga4",          label: "Google Analytics 4",   category: "Analytics",  description: "Google Analytics" },
  { id: "hotjar",       label: "Hotjar",               category: "Analytics",  description: "Heatmaps + opptak" },
  { id: "intercom",     label: "Intercom",             category: "Support",    description: "Live chat + support" },
  { id: "zendesk",      label: "Zendesk",              category: "Support",    description: "Support-billetter" },
  { id: "hubspot",      label: "HubSpot",              category: "CRM",        description: "CRM + marketing" },
  { id: "pipedrive",    label: "Pipedrive",            category: "CRM",        description: "Salgspipeline" },
  { id: "mailchimp",    label: "Mailchimp",            category: "E-post",     description: "E-postmarkedsføring" },
  { id: "twilio",       label: "Twilio SMS",           category: "SMS",        description: "SMS-varsler" },
  { id: "cloudflare-turnstile", label: "Turnstile (anti-spam)", category: "Sikkerhet", description: "CAPTCHA-fritt anti-spam" },
  { id: "upstash",      label: "Upstash Redis",        category: "Rate-limit", description: "Edge rate-limiting" },
  { id: "tiptap",       label: "TipTap (rik tekst)",   category: "CMS",        description: "Rich-text editor" },
  { id: "n8n",          label: "n8n Automatisering",   category: "Automasjon", description: "Workflow-automatisering" },
  { id: "slack",        label: "Slack varsler",        category: "Automasjon", description: "Varsler til Slack" },
];

export const DESIGN_DIRECTIONS: DesignDirection[] = [
  {
    id: "01-dark-luxury-motion",
    label: "Dark Luxury Motion",
    description: "Varme darks, gull-accents, glassmorphism, scroll-animasjoner. Premium-posisjonering.",
    signature: "Orange-glow radial gradients · Glass-cards med backdrop-blur · Scroll-triggered fade-up",
    suitedFor: "Premium tjenester, transport, eiendom, SaaS",
  },
  {
    id: "02-editorial-bento",
    label: "Editorial Bento",
    description: "Asymmetriske grids, store typografi-moments, magazine-feel. Bento-blokker av varierende størrelse.",
    signature: "Grid-brytende komposisjon · Store quote-blokker · Magazine-nummerering",
    suitedFor: "Media, blogg, portefølje, byråer",
  },
  {
    id: "03-swiss-minimal-refined",
    label: "Swiss Minimal Refined",
    description: "Disiplinert rutenett, typografi-drevet, mikro-detaljer. Moderne sveitsisk designtradisjon.",
    signature: "Hairline-borders · Monospace metadata · Generøs whitespace · Typografisk rytme",
    suitedFor: "Konsulent, finans, juridisk, B2B SaaS",
  },
  {
    id: "04-brutalism-refined",
    label: "Brutalism Refined",
    description: "Rå struktur, intensjonell kontrast, hover-kunst. Brutal uten å være lesefiendlig.",
    signature: "Monospace headlines · Bold farge-blokker · Harde shadows · Snap-hover-states",
    suitedFor: "Tech-startups, kreative byråer, kultur",
  },
  {
    id: "05-glassmorphism-depth",
    label: "Glassmorphism Depth",
    description: "Ekte lag med backdrop-blur, gradient mesh bakgrunn, subtil noise/grain.",
    signature: "Kort med faktisk dybde · Hover som trekker frem · Gradient mesh",
    suitedFor: "Fintech, dashboards, AI-produkter",
  },
  {
    id: "06-retro-futurism",
    label: "Retro-Futurism",
    description: "VHS/CRT-elementer, neon, monospace, scanlines. Y2K-revival med moderne build-kvalitet.",
    signature: "Chromatic aberration · Scanline-overlays · Neon-glow · Retro grids",
    suitedFor: "Gaming, musikk, alt-tech, Web3",
  },
  {
    id: "07-scrollytelling-editorial",
    label: "Scrollytelling Editorial",
    description: "Narrativ scroll, sticky stages, progressive reveal. Innholdet er fortellingen.",
    signature: "Sticky containers med sequenced reveals · Scroll-progress-indikator · Fading transitions",
    suitedFor: "Long-form innhold, kampanjer, dokumentar",
  },
  {
    id: "08-3d-integration",
    label: "3D Integration",
    description: "Three.js/Spline integrert i kjerneopplevelsen. Bygger produktforståelse, ikke gimmick.",
    signature: "Roterende produkt-modeller · Scroll-styrt kamera · GPU-akselererte transitions",
    suitedFor: "Produkt-launch, hardware, immersive brands",
  },
  {
    id: "09-industrial-robust",
    label: "Industrial / Robust",
    description: "Matt, taktil, no-nonsense for B2B/transport/anlegg. Funksjonalitet først — ikke kjedelig.",
    signature: "Materielle teksturer · Monospace tall · Harde rutenett · Høy infotetthet",
    suitedFor: "B2B, transport, anlegg, entreprenør",
  },
  {
    id: "10-calm-product-ui",
    label: "Calm Product UI",
    description: "Lys, stille og presis app-flate. Lav visuell støy, hairline-borders, én rolig aksentfarge, alt på 8px-grid.",
    signature: "Hairline-borders · Tett UI-typografi (13–15px) · Kbd-hints · 120ms mikro-transitions",
    suitedFor: "SaaS-apper, dashboards, interne verktøy, portaler",
  },
  {
    id: "11-soft-organic-warmth",
    label: "Soft Organic Warmth",
    description: "Varme nøytraler, store radier, vennlig humanist sans og myke illustrasjoner. Imøtekommende uten å bli barnslig.",
    signature: "Kremhvite flater · 16–24px radier · Duotone-illustrasjoner · Generøs linjehøyde",
    suitedFor: "Helse, utdanning, booking, lokale tjenester, frivillighet",
  },
  {
    id: "12-playful-vibrant",
    label: "Playful Vibrant",
    description: "Mettede farger på store flater, tykke konturer, sticker-elementer og sprett i hover. Energi med byggekvalitet.",
    signature: "Bold fargeblokker · Tykke outlines · Sticker-badges · Spring-basert hover-bounce",
    suitedFor: "Barn/familie, mat og drikke, events, forbrukermerker",
  },
  {
    id: "13-nordic-natural",
    label: "Nordic Natural",
    description: "Jordtoner, fullbredde naturfoto og rolig serif/sans-miks. Stedsfølelse og materialitet framfor effekter.",
    signature: "Mose/skifer/fjord-palett · Fotodrevne heroes · Papir/grain-tekstur · Rolige crossfades",
    suitedFor: "Reiseliv, sjømat/landbruk, håndverk, bærekraft",
  },
  {
    id: "14-dark-developer-mono",
    label: "Dark Developer Mono",
    description: "Mørk-først flate med kalde grånyanser, monospace i UI-et og terminalblokker som designelement.",
    signature: "Near-black med kald grå · Monospace UI-nøkler · Syntax-aksenter · Terminal som hero",
    suitedFor: "Utviklerverktøy, API-produkter, tech-plattformer, hosting",
  },
  {
    id: "15-heritage-editorial",
    label: "Heritage Editorial",
    description: "Klassisk serif-display, varme papirtoner og trykk-tradisjonens ro. Underspilt eleganse, ikke støvete nostalgi.",
    signature: "Serif-display · Small-caps metadata · Tynne linjaler · Spaltebasert grid",
    suitedFor: "Kultur, museum, advokat/tradisjon, vin og håndverksmat, forlag",
  },
  {
    id: "16-aurora-gradient",
    label: "Aurora Gradient",
    description: "Lys flate med mesh/aurora-gradienter bak nøkkelseksjoner og sterk sort typografi. AI-æraens uttrykk uten mørk klisjé.",
    signature: "Mesh-gradienter · Gradient kun på nøkkelord · Glow-shadows i aksent · Raus whitespace",
    suitedFor: "AI-produkter, startups, innovasjonsprosjekter, produktlansering",
  },
];

export const MOTION_OPTIONS = [
  { id: "livlig",  label: "Livlig",  description: "Scroll-animasjoner, parallax, signature moments med bevegelse" },
  { id: "subtil",  label: "Subtil",  description: "Diskrete hover-states, smooth transitions, minimal distraksjon" },
  { id: "ingen",   label: "Ingen",   description: "Statisk — ingen animasjoner utover nødvendige UI-states" },
];

export const AUTH_OPTIONS = [
  { id: "supabase-auth",  label: "E-post + passord",     description: "Klassisk innlogging med e-post og passord" },
  { id: "magic-link",     label: "Magic link (e-post)",  description: "Passordfri — klikk lenke i e-post" },
  { id: "oauth",          label: "OAuth (Google/GitHub)", description: "Logg inn med Google eller GitHub" },
  { id: "ingen",          label: "Ingen auth",           description: "Kun offentlig innhold, ingen innlogging" },
];

export const PROJECT_TYPES = [
  { id: "webApp",      label: "Web-applikasjon" },
  { id: "landingPage", label: "Nettside / Landingsside" },
  { id: "ecommerce",   label: "Nettbutikk" },
  { id: "saas",        label: "SaaS-produkt" },
  { id: "api",         label: "API / Backend" },
  { id: "mobile",      label: "Mobilapp" },
  { id: "integration", label: "Integrasjon / Automasjon" },
  { id: "cms",         label: "CMS / Blogg" },
  { id: "other",       label: "Annet" },
];
