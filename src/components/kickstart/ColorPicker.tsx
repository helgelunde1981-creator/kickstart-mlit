"use client";
import { useEffect, useId, useState } from "react";

const PRESETS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6B7280",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  loadPriorColors?: boolean;
}

export default function ColorPicker({
  value,
  onChange,
  label = "Primærfarge",
  loadPriorColors = true,
}: Props) {
  const [priorColors, setPriorColors] = useState<string[]>([]);
  const id = useId();

  useEffect(() => {
    if (!loadPriorColors) return;
    fetch("/api/kickstart/prior-colors")
      .then((r) => (r.ok ? r.json() : []))
      .then((colors: string[]) => setPriorColors(Array.isArray(colors) ? colors : []))
      .catch(() => {});
  }, [loadPriorColors]);

  const allColors = [...new Set([...priorColors, ...PRESETS])];

  return (
    <div>
      <label htmlFor={`${id}-hex`} className="field-label">
        {label}
      </label>

      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label={`${label} — forhåndsvalg`}>
        {allColors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`Velg ${c}`}
            aria-pressed={value.toLowerCase() === c.toLowerCase()}
            title={priorColors.includes(c) ? `${c} — brukt i et tidligere prosjekt` : c}
            className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
              value.toLowerCase() === c.toLowerCase()
                ? "scale-110 ring-2 ring-fg ring-offset-2 ring-offset-[var(--surface)]"
                : "ring-1 ring-line"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#3B82F6"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={`${label} — fargevelger`}
          className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-surface p-1"
        />
        <input
          id={`${id}-hex`}
          type="text"
          value={value}
          onChange={(e) => {
            const next = e.target.value.toUpperCase();
            if (/^#?[0-9A-F]{0,6}$/.test(next)) onChange(next.startsWith("#") || next === "" ? next : `#${next}`);
          }}
          className="input w-32 font-mono"
          placeholder="#3B82F6"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
