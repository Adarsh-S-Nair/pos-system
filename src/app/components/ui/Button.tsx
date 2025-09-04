"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

const baseStyles =
  "inline-flex select-none items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<string, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] shadow-sm hover:shadow md:shadow transition-shadow",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_5%)] border border-[var(--color-border)]",
  ghost:
    "bg-transparent text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_92%)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], fullWidth && "w-full", className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;


