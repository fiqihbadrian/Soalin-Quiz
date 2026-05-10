"use client";

import { SEMESTER_DESCRIPTIONS } from "@/lib/types";

interface SemesterSelectorProps {
  value: number;
  onChange: (semester: number) => void;
}

export function SemesterSelector({ value, onChange }: SemesterSelectorProps) {
  const selected = SEMESTER_DESCRIPTIONS.find((s) => s.level === value);

  return (
    <div>
      {/* Segmented button grid — flat, no gradients */}
      <div className="grid grid-cols-4 gap-2">
        {SEMESTER_DESCRIPTIONS.map((sem) => {
          const isActive = sem.level === value;
          return (
            <button
              key={sem.level}
              type="button"
              onClick={() => onChange(sem.level)}
              className={[
                "py-2 px-2 text-sm rounded-md border transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:ring-offset-2 focus:ring-offset-[#0d1117]",
                isActive
                  ? "bg-[#238636] border-[#238636] text-white hover:bg-[#2ea043]"
                  : "bg-[#161b22] border-[#30363d] text-[#e6edf3] hover:border-[#8b949e]",
              ].join(" ")}
              aria-pressed={isActive}
            >
              S{sem.level}
            </button>
          );
        })}
      </div>

      {selected ? (
        <p className="mt-3 text-sm text-[#8b949e]">
          <span className="text-[#e6edf3] font-medium">{selected.label}:</span>{" "}
          {selected.description}
        </p>
      ) : null}
    </div>
  );
}
