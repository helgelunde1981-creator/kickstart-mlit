"use client";
import { useState } from "react";
import {
  TECH_OPTIONS,
  INTEGRATION_OPTIONS,
  DESIGN_DIRECTIONS,
  MOTION_OPTIONS,
  AUTH_OPTIONS,
} from "@/lib/kickstart/tech-options";
import { KickstartProject } from "@/lib/kickstart/types";
import { ProjectEditableFields } from "@/lib/kickstart/queries";
import ChipSelector from "./ChipSelector";
import ColorPicker from "./ColorPicker";
import DesignDirectionPreview from "./DesignDirectionPreview";

interface Props {
  project: KickstartProject;
  onSaved: (fields: ProjectEditableFields) => void;
  onCancel: () => void;
}

export default function ProjectEditForm({ project, onSaved, onCancel }: Props) {
  const [techStack, setTechStack] = useState<string[]>(project.tech_stack ?? []);
  const [integrations, setIntegrations] = useState<string[]>(project.integrations ?? []);
  const [designDirection, setDesignDirection] = useState(project.design_direction ?? "03-swiss-minimal-refined");
  const [authType, setAuthType] = useState(project.auth_type ?? "supabase-auth");
  const [primaryColor, setPrimaryColor] = useState(project.primary_color ?? "#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState(project.secondary_color ?? "");
  const [motionPreference, setMotionPreference] = useState(project.motion_preference ?? "subtil");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fields: ProjectEditableFields = {
      tech_stack: techStack,
      integrations,
      design_direction: designDirection,
      auth_type: authType,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      motion_preference: motionPreference,
    };
    try {
      const res = await fetch("/api/kickstart/update-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, ...fields }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Serverfeil: ${res.status}`);
      }
      onSaved(fields);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card space-y-6 p-5">
      <div>
        <h2 className="font-semibold">Rediger prosjekt</h2>
        {project.project_md && (
          <p className="mt-1 text-xs text-warning">
            PROJECT.md er allerede generert med de gamle verdiene. Endringene slår først inn når du
            regenererer specen.
          </p>
        )}
      </div>

      <div>
        <p className="field-label">Teknologier</p>
        <ChipSelector options={TECH_OPTIONS} selected={techStack} onChange={setTechStack} />
      </div>

      <div>
        <p className="field-label">Integrasjoner</p>
        <ChipSelector options={INTEGRATION_OPTIONS} selected={integrations} onChange={setIntegrations} />
      </div>

      <fieldset>
        <legend className="field-label">Designretning</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DESIGN_DIRECTIONS.map((d) => {
            const sel = designDirection === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDesignDirection(d.id)}
                aria-pressed={sel}
                className="choice overflow-hidden p-0"
              >
                <DesignDirectionPreview id={d.id} selected={sel} />
                <div className="px-3 py-2">
                  <p className={`text-xs font-semibold leading-tight ${sel ? "text-accent" : ""}`}>{d.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted">{d.suitedFor}</p>
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ColorPicker value={primaryColor} onChange={setPrimaryColor} label="Primærfarge" />
        <ColorPicker
          value={secondaryColor}
          onChange={setSecondaryColor}
          label="Sekundærfarge"
          loadPriorColors={false}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit_auth_type" className="field-label">
            Autentisering
          </label>
          <select
            id="edit_auth_type"
            value={authType}
            onChange={(e) => setAuthType(e.target.value)}
            className="input"
          >
            {AUTH_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label} — {o.description}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="field-label">Bevegelse / motion</legend>
          <div className="grid grid-cols-3 gap-2">
            {MOTION_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setMotionPreference(o.id)}
                aria-pressed={motionPreference === o.id}
                title={o.description}
                className="choice px-3 py-2 text-sm font-medium"
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Lagrer…" : "Lagre"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn btn-secondary">
          Avbryt
        </button>
      </div>
    </form>
  );
}
