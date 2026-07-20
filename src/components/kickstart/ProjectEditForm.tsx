"use client";
import { useState } from "react";
import {
  TECH_OPTIONS,
  INTEGRATION_OPTIONS,
  DESIGN_DIRECTIONS,
  MOTION_OPTIONS,
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
  const [primaryColor, setPrimaryColor] = useState(project.primary_color ?? "#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState(project.secondary_color ?? "");
  const [motionPreference, setMotionPreference] = useState(project.motion_preference ?? "subtil");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const fields: ProjectEditableFields = {
      tech_stack: techStack,
      integrations,
      design_direction: designDirection,
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">
      <div>
        <h2 className="font-semibold text-gray-900 mb-1">Rediger prosjekt</h2>
        {project.project_md && (
          <p className="text-xs text-amber-600">
            PROJECT.md er allerede generert med de gamle verdiene — trykk &quot;Regenerer spec&quot; etter lagring for at endringene skal slå inn.
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Teknologier</p>
        <ChipSelector options={TECH_OPTIONS} selected={techStack} onChange={setTechStack} />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Integrasjoner</p>
        <ChipSelector options={INTEGRATION_OPTIONS} selected={integrations} onChange={setIntegrations} />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Designretning</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DESIGN_DIRECTIONS.map((d) => {
            const sel = designDirection === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDesignDirection(d.id)}
                className={`text-left rounded-xl border overflow-hidden transition-all
                  ${sel ? "border-blue-600 ring-2 ring-blue-600" : "border-gray-200 hover:border-gray-300"}`}
              >
                <DesignDirectionPreview id={d.id} selected={sel} />
                <div className="px-3 py-2">
                  <p className={`text-xs font-semibold leading-tight ${sel ? "text-blue-700" : "text-gray-900"}`}>
                    {d.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{d.suitedFor}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ColorPicker value={primaryColor} onChange={setPrimaryColor} label="Primærfarge" />
        <ColorPicker value={secondaryColor} onChange={setSecondaryColor} label="Sekundærfarge" loadPriorColors={false} />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Bevegelse / motion</p>
        <div className="grid grid-cols-3 gap-2">
          {MOTION_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setMotionPreference(o.id)}
              className={`text-left px-3 py-2 rounded-lg border text-sm
                ${motionPreference === o.id
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
            >
              <p className="font-medium">{o.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{o.description}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Lagrer..." : "Lagre"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
