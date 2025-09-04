"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  fullWidth?: boolean;
};

const baseStyles =
  "block rounded-md border bg-[var(--color-input-bg)] text-[var(--color-input-fg)] placeholder-[var(--color-input-placeholder)] border-[var(--color-border)] px-3 py-2 text-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent hover:bg-[color-mix(in_oklab,var(--color-input-bg),var(--color-fg)_4%)] disabled:opacity-50 disabled:pointer-events-none";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid = false, fullWidth = true, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(baseStyles, fullWidth && "w-full", invalid && "border-[var(--color-danger)]", className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;


