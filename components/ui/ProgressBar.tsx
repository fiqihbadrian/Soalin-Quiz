interface ProgressBarProps {
  value: number; // current value
  max: number;   // total
  className?: string;
}

export function ProgressBar({ value, max, className = "" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={[
        "w-full h-2 bg-[#21262d] border border-[#30363d] rounded-md overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* Flat solid fill — no gradient */}
      <div
        className="h-full bg-[#238636] transition-all duration-200"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
