"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#238636] hover:bg-[#2ea043] text-white border border-[#238636] hover:border-[#2ea043] disabled:bg-[#1a3a20] disabled:border-[#1a3a20] disabled:text-[#8b949e]",
  secondary:
    "bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] disabled:opacity-50",
  ghost:
    "bg-transparent hover:bg-[#21262d] text-[#e6edf3] border border-transparent disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:ring-offset-2 focus:ring-offset-[#0d1117]",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
