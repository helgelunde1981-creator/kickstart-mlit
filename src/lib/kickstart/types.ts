export type ProjectStatus = "draft" | "generated" | "bootstrapped";

export interface KickstartProject {
  id: string;
  created_at: string;
  updated_at: string;
  client_name: string;
  project_name: string;
  project_type: string;
  tech_stack: string[];
  primary_color: string | null;
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
  client_name: string;
  project_name: string;
  project_type: string;
  tech_stack: string[];
  primary_color: string;
  short_description: string;
  long_description: string;
}

export interface TechOption {
  id: string;
  label: string;
  category: string;
  description?: string;
}

export interface BootstrapResult {
  github_repo_url?: string;
  supabase_project_ref?: string;
  vercel_project_id?: string;
  errors: string[];
}

export type StreamEvent =
  | { type: "part"; part: number; content: string }
  | { type: "done"; project_md: string }
  | { type: "error"; message: string };

export type BootstrapEvent =
  | { type: "step"; message: string }
  | { type: "done"; result: BootstrapResult }
  | { type: "error"; message: string };
