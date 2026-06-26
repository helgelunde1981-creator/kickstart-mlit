export type ProjectStatus = "draft" | "generated" | "bootstrapped";

export interface KickstartProject {
  id: string;
  created_at: string;
  updated_at: string;
  client_name: string;
  project_name: string;
  project_type: string;
  tech_stack: string[];
  integrations: string[];
  primary_color: string | null;
  secondary_color: string | null;
  contact_person: string | null;
  new_domain: string | null;
  existing_url: string | null;
  design_direction: string | null;
  motion_preference: string | null;
  auth_type: string | null;
  sprint_estimate: number | null;
  requires_scrape: boolean;
  features: string | null;
  extra_notes: string | null;
  short_description: string | null;
  long_description: string | null;
  status: ProjectStatus;
  project_md: string | null;
  price_estimate: PriceEstimate | null;
  github_repo_url: string | null;
  supabase_project_ref: string | null;
  vercel_project_id: string | null;
  step_completed: number;
}

export interface PriceEstimate {
  total_min: number;
  total_max: number;
  currency: string;
  breakdown: PriceLineItem[];
  hourly_rate: number;
  notes: string;
}

export interface PriceLineItem {
  label: string;
  hours_min: number;
  hours_max: number;
  description: string;
}

export interface WizardFormData {
  // Steg 1 — Kundeinfo
  client_name: string;
  project_name: string;
  contact_person: string;
  new_domain: string;
  existing_url: string;
  // Steg 2 — Prosjekttype
  project_type: string;
  auth_type: string;
  sprint_estimate: number;
  requires_scrape: boolean;
  // Steg 3 — Teknologier
  tech_stack: string[];
  integrations: string[];
  // Steg 4 — Designretning
  design_direction: string;
  // Steg 5 — Designdetaljer
  primary_color: string;
  secondary_color: string;
  motion_preference: string;
  // Steg 6 — Features
  features: string;
  extra_notes: string;
  // Steg 7 — Beskrivelse
  short_description: string;
  long_description: string;
}

export interface TechOption {
  id: string;
  label: string;
  category: string;
  description?: string;
}

export interface DesignDirection {
  id: string;
  label: string;
  description: string;
  signature: string;
  suitedFor: string;
}

export interface BootstrapResult {
  github_repo_url?: string;
  supabase_project_ref?: string;
  vercel_project_id?: string;
  errors: string[];
}

export type VerifyCheck = { label: string; ok: boolean };

export type StreamEvent =
  | { type: "start_part"; part: number; title: string }
  | { type: "delta"; text: string }
  | { type: "part"; part: number; title: string; content: string }
  | { type: "continue"; project_id: string }
  | { type: "verify"; ok: boolean; checks: VerifyCheck[] }
  | { type: "done"; project_md: string }
  | { type: "error"; message: string };

export type BootstrapEvent =
  | { type: "step"; message: string }
  | { type: "done"; result: BootstrapResult }
  | { type: "error"; message: string };
