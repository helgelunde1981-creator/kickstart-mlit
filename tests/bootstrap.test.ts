import { describe, expect, it } from "vitest";
import { repoSlug } from "@/lib/kickstart/bootstrap/github";
import { toWizardFormData, handoffSchema, wizardSchema } from "@/lib/kickstart/validation";

describe("repoSlug", () => {
  it("gjør norske prosjektnavn om til gyldige repo-navn", () => {
    expect(repoSlug("Ørje Bygg & Anlegg")).toBe("orje-bygg-anlegg");
    expect(repoSlug("Acme  Kundeportal")).toBe("acme-kundeportal");
  });

  it("kaster hvis navnet ikke gir noe brukbart", () => {
    expect(() => repoSlug("!!!")).toThrow();
  });
});

describe("LeadRadar-intake", () => {
  it("fyller ut defaults for felter LeadRadar ikke sender", () => {
    const parsed = handoffSchema.parse({ client_name: "Acme AS", project_name: "Acme Portal" });
    const form = toWizardFormData(parsed);
    expect(form.tech_stack.length).toBeGreaterThan(0);
    expect(form.design_direction).toBe("03-swiss-minimal-refined");
    expect(form.sprint_estimate).toBe(6);
  });

  it("avviser tomt kundenavn", () => {
    expect(handoffSchema.safeParse({ client_name: "", project_name: "X" }).success).toBe(false);
  });
});

describe("wizardSchema", () => {
  const gyldig = {
    client_name: "Acme AS",
    project_name: "Acme Portal",
    contact_person: "",
    new_domain: "",
    existing_url: "",
    project_type: "webApp",
    auth_type: "supabase-auth",
    sprint_estimate: 6,
    requires_scrape: false,
    tech_stack: ["nextjs"],
    integrations: [],
    design_direction: "03-swiss-minimal-refined",
    primary_color: "#3B82F6",
    secondary_color: "",
    motion_preference: "subtil",
    features: "",
    extra_notes: "",
    short_description: "En portal for kundene til Acme",
    long_description: "x".repeat(60),
  };

  it("godtar et komplett skjema", () => {
    expect(wizardSchema.safeParse(gyldig).success).toBe(true);
  });

  it("krever URL når scrape er huket av", () => {
    const result = wizardSchema.safeParse({ ...gyldig, requires_scrape: true });
    expect(result.success).toBe(false);
  });
});
