"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  fullWidth?: boolean;
};

const baseStyles =
  "block appearance-none rounded-md border bg-[var(--color-input-bg)] text-[var(--color-input-fg)] border-[var(--color-border)] px-3 py-2 text-sm transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent hover:bg-[color-mix(in_oklab,var(--color-input-bg),var(--color-fg)_4%)] disabled:opacity-50 disabled:pointer-events-none";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, fullWidth = true, children, ...props }, ref) => {
    return (
      <div className={clsx("relative", fullWidth && "w-full")}>
        <select ref={ref} className={clsx(baseStyles, fullWidth && "w-full", className)} {...props}>
          {children}
        </select>
        {/* caret */}
        <svg
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;


