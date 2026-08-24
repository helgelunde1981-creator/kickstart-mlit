import { z } from "zod";
import { WizardFormData } from "./types";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Ugyldig farge (må være #RRGGBB)")
  .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/.+\..+/.test(v), "Må være en full URL (https://…)");

export const wizardSchema = z
  .object({
    client_name:       z.string().trim().min(1, "Kundenavn er påkrevd").max(120),
    project_name:      z.string().trim().min(1, "Prosjektnavn er påkrevd").max(120),
    contact_person:    z.string().max(200),
    new_domain:        z.string().trim().max(200),
    existing_url:      optionalUrl,
    project_type:      z.string().min(1, "Prosjekttype er påkrevd"),
    auth_type:         z.string(),
    sprint_estimate:   z.number().int().min(1, "Minst 1 sprint").max(20, "Maks 20 sprinter"),
    requires_scrape:   z.boolean(),
    tech_stack:        z.array(z.string()).min(1, "Velg minst én teknologi"),
    integrations:      z.array(z.string()),
    design_direction:  z.string().min(1, "Velg en designretning"),
    primary_color:     hexColor,
    secondary_color:   hexColor,
    motion_preference: z.string(),
    features:          z.string().max(20_000),
    extra_notes:       z.string().max(20_000),
    short_description: z.string().trim().min(10, "Minimum 10 tegn").max(300),
    long_description:  z.string().trim().min(50, "Minimum 50 tegn").max(20_000),
  })
  // Huket av for scrape uten å oppgi URL er en tabbe det er billig å fange her,
  // framfor at Claude skriver en scrape-pipeline mot ingenting.
  .refine((d) => !d.requires_scrape || d.existing_url.length > 0, {
    path: ["existing_url"],
    message: "Oppgi URL-en som skal scrapes",
  });

export type WizardSchema = z.infer<typeof wizardSchema>;

/**
 * LeadRadar-intake. Samme datamodell, men alt utenom kunde/prosjekt er
 * valgfritt — resten fylles ut av Helge i admin før specen regenereres.
 */
export const handoffSchema = z.object({
  client_name:       z.string().trim().min(1).max(120),
  project_name:      z.string().trim().min(1).max(120),
  contact_person:    z.string().max(200).optional(),
  new_domain:        z.string().max(200).optional(),
  existing_url:      z.string().max(500).optional(),
  project_type:      z.string().optional(),
  auth_type:         z.string().optional(),
  sprint_estimate:   z.number().int().min(1).max(20).optional(),
  requires_scrape:   z.boolean().optional(),
  tech_stack:        z.array(z.string()).optional(),
  integrations:      z.array(z.string()).optional(),
  design_direction:  z.string().optional(),
  primary_color:     z.string().optional(),
  secondary_color:   z.string().optional(),
  motion_preference: z.string().optional(),
  features:          z.string().max(20_000).optional(),
  extra_notes:       z.string().max(20_000).optional(),
  short_description: z.string().max(300).optional(),
  long_description:  z.string().max(20_000).optional(),
});

export const DEFAULT_TECH_STACK = [
  "nextjs",
  "typescript",
  "tailwind",
  "shadcn",
  "supabase",
  "supabase-auth",
  "vercel",
  "resend",
];

export function toWizardFormData(input: z.infer<typeof handoffSchema>): WizardFormData {
  return {
    client_name:       input.client_name,
    project_name:      input.project_name,
    contact_person:    input.contact_person ?? "",
    new_domain:        input.new_domain ?? "",
    existing_url:      input.existing_url ?? "",
    project_type:      input.project_type ?? "landingPage",
    auth_type:         input.auth_type ?? "supabase-auth",
    sprint_estimate:   input.sprint_estimate ?? 6,
    requires_scrape:   input.requires_scrape ?? false,
    tech_stack:        input.tech_stack?.length ? input.tech_stack : DEFAULT_TECH_STACK,
    integrations:      input.integrations ?? [],
    design_direction:  input.design_direction ?? "03-swiss-minimal-refined",
    primary_color:     input.primary_color ?? "#3B82F6",
    secondary_color:   input.secondary_color ?? "",
    motion_preference: input.motion_preference ?? "subtil",
    features:          input.features ?? "",
    extra_notes:       input.extra_notes ?? "",
    short_description: input.short_description ?? "",
    long_description:  input.long_description ?? "",
  };
}
