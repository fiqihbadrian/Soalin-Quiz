interface SpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ label, size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={[
        "inline-flex items-center gap-3 text-[#8b949e]",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <span
        className={[
          "inline-block animate-spin rounded-full border-[#30363d] border-t-[#e6edf3]",
          sizeClasses[size],
        ].join(" ")}
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  );
}
