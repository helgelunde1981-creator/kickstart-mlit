import { z } from "zod";

export const wizardSchema = z.object({
  client_name:       z.string().min(1, "Kundenavn er påkrevd"),
  project_name:      z.string().min(1, "Prosjektnavn er påkrevd"),
  contact_person:    z.string(),
  new_domain:        z.string(),
  existing_url:      z.string(),
  project_type:      z.string().min(1, "Prosjekttype er påkrevd"),
  auth_type:         z.string(),
  sprint_estimate:   z.number().int().min(1).max(20),
  requires_scrape:   z.boolean(),
  tech_stack:        z.array(z.string()).min(1, "Velg minst én teknologi"),
  integrations:      z.array(z.string()),
  design_direction:  z.string().min(1, "Velg en designretning"),
  primary_color:     z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ugyldig farge").or(z.literal("")),
  secondary_color:   z.string(),
  motion_preference: z.string(),
  features:          z.string(),
  extra_notes:       z.string(),
  short_description: z.string().min(10, "Minimum 10 tegn"),
  long_description:  z.string().min(50, "Minimum 50 tegn"),
});

export type WizardSchema = z.infer<typeof wizardSchema>;
