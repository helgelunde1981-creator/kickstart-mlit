"use client";
import { TechOption } from "@/lib/kickstart/types";

interface Props {
  options: TechOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ChipSelector({ options, selected, onChange }: Props) {
  const categories = [...new Set(options.map((o) => o.category))];

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <fieldset key={cat}>
          <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">{cat}</legend>
          <div className="flex flex-wrap gap-2">
            {options
              .filter((o) => o.category === cat)
              .map((opt) => {
                const isSelected = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(opt.id)}
                    aria-pressed={isSelected}
                    title={opt.description}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      isSelected
                        ? "border-accent bg-accent text-on-accent"
                        : "border-line text-muted hover:border-accent"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
