import { z } from "zod";

export const wizardSchema = z.object({
  client_name: z.string().min(1, "Kundenavn er påkrevd"),
  project_name: z.string().min(1, "Prosjektnavn er påkrevd"),
  project_type: z.string().min(1, "Prosjekttype er påkrevd"),
  tech_stack: z.array(z.string()).min(1, "Velg minst én teknologi"),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Ugyldig farge").or(z.literal("")),
  short_description: z.string().min(10, "Minimum 10 tegn"),
  long_description: z.string().min(50, "Minimum 50 tegn"),
});

export type WizardSchema = z.infer<typeof wizardSchema>;

export const step1Schema = wizardSchema.pick({ client_name: true, project_name: true });
export const step2Schema = wizardSchema.pick({ project_type: true });
export const step3Schema = wizardSchema.pick({ tech_stack: true });
export const step4Schema = wizardSchema.pick({ primary_color: true });
export const step5Schema = wizardSchema.pick({ short_description: true, long_description: true });
