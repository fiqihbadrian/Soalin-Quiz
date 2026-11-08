"use client";

import { SEMESTER_DESCRIPTIONS } from "@/lib/types";

export function SemesterSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (level: number) => void;
}) {
  const active =
    SEMESTER_DESCRIPTIONS.find((item) => item.level === value) ??
    SEMESTER_DESCRIPTIONS[0];

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">
        Semester materi
      </legend>
      <div className="grid grid-cols-4 gap-2">
        {SEMESTER_DESCRIPTIONS.map((item) => {
          const selected = item.level === value;
          return (
            <button
              key={item.level}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(item.level)}
              className={`min-h-11 rounded-[10px] border font-mono text-sm tabular transition-colors ${
                selected
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-rule bg-paper text-ink-muted hover:border-ink-muted hover:text-ink"
              }`}
            >
              {item.level}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-ink-muted">{active.description}</p>
    </fieldset>
  );
}
