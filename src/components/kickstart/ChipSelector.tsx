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
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{cat}</p>
          <div className="flex flex-wrap gap-2">
            {options
              .filter((o) => o.category === cat)
              .map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors
                    ${selected.includes(opt.id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {opt.label}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
