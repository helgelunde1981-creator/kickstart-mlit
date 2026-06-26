import { z } from "zod";

export const wizardSchema = z.object({
  client_name:       z.string().min(1, "Kundenavn er påkrevd"),
  project_name:      z.string().min(1, "Prosjektnavn er påkrevd"),
  contact_person:    z.string().default(""),
  new_domain:        z.string().default(""),
  existing_url:      z.string().default(""),
  project_type:      z.string().min(1, "Prosjekttype er påkrevd"),
  auth_type:         z.string().default("supabase-auth"),
  sprint_estimate:   z.number().int().min(1).max(20).default(6),
  requires_scrape:   z.boolean().default(false),
  tech_stack:        z.array(z.string()).min(1, "Velg minst én teknologi"),
  integrations:      z.array(z.string()).default([]),
  design_direction:  z.string().min(1, "Velg en designretning"),
  primary_color:     z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ugyldig farge").or(z.literal("")).default("#3B82F6"),
  secondary_color:   z.string().default(""),
  motion_preference: z.string().default("subtil"),
  features:          z.string().default(""),
  extra_notes:       z.string().default(""),
  short_description: z.string().min(10, "Minimum 10 tegn"),
  long_description:  z.string().min(50, "Minimum 50 tegn"),
});

export type WizardSchema = z.infer<typeof wizardSchema>;
