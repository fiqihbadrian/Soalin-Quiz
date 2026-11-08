import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-[10px] border font-medium transition-colors disabled:opacity-55 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "border-accent bg-accent text-accent-fg hover:border-accent-hover hover:bg-accent-hover",
  secondary:
    "border-rule bg-surface text-ink hover:border-ink-muted hover:bg-surface-strong",
  quiet:
    "border-transparent bg-transparent text-ink-muted hover:bg-surface-strong hover:text-ink",
  danger:
    "border-danger/40 bg-transparent text-danger hover:border-danger hover:bg-danger-soft",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-3 text-sm",
  md: "min-h-12 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export const buttonStyles = (variant: Variant = "primary", size: Size = "md") =>
  `${base} ${variants[variant]} ${sizes[size]}`;
