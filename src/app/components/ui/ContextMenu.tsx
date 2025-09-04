"use client";

import { PropsWithChildren, useEffect, useRef, useState } from "react";
import clsx from "clsx";

type ContextMenuProps = PropsWithChildren<{
  trigger: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}>;

export default function ContextMenu({ trigger, align = "right", children, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className={clsx("relative", className)} ref={ref}>
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={clsx(
            "absolute mt-2 w-48 overflow-hidden rounded-lg bg-[var(--color-bg)] shadow-xl z-50",
            "border border-[color-mix(in_oklab,var(--color-border),transparent_50%)]",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

type ContextMenuItemProps = {
  icon?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
};

export function ContextMenuItem({ icon, onClick, children, disabled = false, destructive = false }: ContextMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
        "hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]",
        "focus:outline-none focus:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        destructive && "text-[var(--color-danger)] hover:text-[var(--color-danger)]"
      )}
    >
      {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function ContextMenuSeparator() {
  return <div className="h-px bg-[color-mix(in_oklab,var(--color-border),transparent_50%)]" />;
}
