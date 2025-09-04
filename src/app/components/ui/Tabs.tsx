"use client";

import { useState, PropsWithChildren, ReactNode } from "react";
import clsx from "clsx";

type Tab = {
  key: string;
  label: string;
  content: ReactNode;
};

type TabsProps = PropsWithChildren<{
  tabs: Tab[];
  initialKey?: string;
  className?: string;
}>;

export default function Tabs({ tabs, initialKey, className }: TabsProps) {
  const [active, setActive] = useState<string>(initialKey ?? tabs[0]?.key);

  return (
    <div className={clsx("w-full", className)}>
      <div className="flex gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={clsx(
                "relative flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                "hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]",
                isActive &&
                  "bg-[var(--color-bg)] shadow-sm text-[var(--color-fg)]"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 animate-in fade-in zoom-in-95 duration-200">
        {tabs.find((t) => t.key === active)?.content}
      </div>
    </div>
  );
}


