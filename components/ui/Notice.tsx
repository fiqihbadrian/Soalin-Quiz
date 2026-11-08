import type { ReactNode } from "react";

type Tone = "info" | "warn" | "danger" | "success";

const tones: Record<Tone, string> = {
  info: "border-rule bg-surface-strong text-ink",
  warn: "border-warn/40 bg-warn-soft text-warn",
  danger: "border-danger/40 bg-danger-soft text-danger",
  success: "border-accent/40 bg-accent-soft text-accent",
};

const labels: Record<Tone, string> = {
  info: "Catatan",
  warn: "Perhatian",
  danger: "Gagal",
  success: "Berhasil",
};

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`rounded-[10px] border px-4 py-3 text-sm ${tones[tone]}`}
    >
      <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.08em] opacity-80">
        {title ?? labels[tone]}
      </p>
      <div className="text-ink">{children}</div>
    </div>
  );
}
