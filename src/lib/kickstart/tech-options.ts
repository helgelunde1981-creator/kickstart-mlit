import { TechOption } from "./types";

export const TECH_OPTIONS: TechOption[] = [
  // Frontend
  { id: "nextjs", label: "Next.js", category: "Frontend" },
  { id: "react", label: "React", category: "Frontend" },
  { id: "vue", label: "Vue.js", category: "Frontend" },
  { id: "svelte", label: "SvelteKit", category: "Frontend" },
  { id: "tailwind", label: "Tailwind CSS", category: "Frontend" },
  { id: "shadcn", label: "shadcn/ui", category: "Frontend" },
  // Backend
  { id: "nodejs", label: "Node.js", category: "Backend" },
  { id: "fastapi", label: "FastAPI (Python)", category: "Backend" },
  { id: "express", label: "Express.js", category: "Backend" },
  { id: "nestjs", label: "NestJS", category: "Backend" },
  // Database
  { id: "supabase", label: "Supabase", category: "Database" },
  { id: "postgres", label: "PostgreSQL", category: "Database" },
  { id: "mysql", label: "MySQL", category: "Database" },
  { id: "mongodb", label: "MongoDB", category: "Database" },
  { id: "prisma", label: "Prisma ORM", category: "Database" },
  // Auth
  { id: "supabase-auth", label: "Supabase Auth", category: "Auth" },
  { id: "nextauth", label: "NextAuth.js", category: "Auth" },
  { id: "clerk", label: "Clerk", category: "Auth" },
  // Hosting / VCS
  { id: "vercel", label: "Vercel", category: "Hosting" },
  { id: "github", label: "GitHub", category: "Hosting" },
  { id: "fly", label: "Fly.io", category: "Hosting" },
  { id: "railway", label: "Railway", category: "Hosting" },
  // Other
  { id: "typescript", label: "TypeScript", category: "Language" },
  { id: "stripe", label: "Stripe", category: "Payments" },
  { id: "resend", label: "Resend", category: "Email" },
  { id: "uploadthing", label: "UploadThing", category: "Storage" },
  { id: "openai", label: "OpenAI", category: "AI" },
  { id: "anthropic", label: "Anthropic Claude", category: "AI" },
];

export const PROJECT_TYPES = [
  { id: "webApp", label: "Web-applikasjon" },
  { id: "landingPage", label: "Nettside / Landingsside" },
  { id: "ecommerce", label: "Nettbutikk" },
  { id: "saas", label: "SaaS-produkt" },
  { id: "api", label: "API / Backend" },
  { id: "mobile", label: "Mobilapp" },
  { id: "integration", label: "Integrasjon / Automasjon" },
  { id: "other", label: "Annet" },
];
