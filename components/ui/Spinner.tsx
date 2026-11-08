export function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-sm text-ink-muted">
      <svg
        viewBox="0 0 16 16"
        className="h-4 w-4 animate-spin text-accent"
        aria-hidden="true"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="12 26"
          strokeLinecap="round"
        />
      </svg>
      <span>{label}</span>
    </span>
  );
}
