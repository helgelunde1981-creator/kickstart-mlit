"use client";
import { useEffect, useState } from "react";

const PRESETS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6B7280",
];

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  const [priorColors, setPriorColors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/kickstart/prior-colors")
      .then((r) => r.json())
      .then((colors: string[]) => setPriorColors(colors))
      .catch(() => {});
  }, []);

  const allColors = [...new Set([...priorColors, ...PRESETS])];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Primærfarge</label>

      <div className="flex flex-wrap gap-2 mb-4">
        {allColors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
              ${value === c ? "border-gray-900 scale-110" : "border-transparent"}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#3B82F6"
        />
        <div
          className="w-10 h-10 rounded-lg border border-gray-200"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  );
}
