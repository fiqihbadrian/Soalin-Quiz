import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  error?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", padded = true, error = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "bg-[#161b22] rounded-md",
          error ? "border border-red-500/60" : "border border-[#30363d]",
          padded ? "p-5 sm:p-6" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
