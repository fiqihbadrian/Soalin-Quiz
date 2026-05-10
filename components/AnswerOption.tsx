"use client";

interface AnswerOptionProps {
  optionKey: string;
  text: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function AnswerOption({
  optionKey,
  text,
  selected,
  onSelect,
  disabled = false,
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={[
        "w-full text-left p-4 rounded-md border transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:ring-offset-2 focus:ring-offset-[#0d1117]",
        "disabled:cursor-not-allowed",
        selected
          ? "bg-[#1f2a1f] border-[#238636]"
          : "bg-[#161b22] border-[#30363d] hover:border-[#8b949e]",
      ].join(" ")}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-sm font-semibold border",
            selected
              ? "bg-[#238636] border-[#238636] text-white"
              : "bg-[#0d1117] border-[#30363d] text-[#8b949e]",
          ].join(" ")}
        >
          {optionKey}
        </span>
        <span className="text-[#e6edf3] leading-relaxed">{text}</span>
      </div>
    </button>
  );
}
