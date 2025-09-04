"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { LuMenu } from "react-icons/lu";

export default function Topbar() {
  const pathname = usePathname();
  const title = useMemo(() => {
    if (pathname.startsWith("/devices")) return "Devices & Lanes";
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/transactions")) return "Transactions";
    if (pathname.startsWith("/items")) return "Items";
    if (pathname.startsWith("/categories")) return "Categories";
    if (pathname.startsWith("/reports")) return "Reports";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Crate";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 h-16 bg-[var(--color-content-bg)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--color-content-bg),transparent_6%)]">
      <div className="mx-auto max-w-[1400px] px-4 h-full flex items-center gap-3">
        <button id="sidebar-toggle" className="lg:hidden p-2 cursor-pointer rounded-md">
          <LuMenu className="h-4 w-4" />
        </button>
        <h1 className="text-sm md:text-base font-semibold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="ml-2 h-8 w-8 rounded-full bg-[color-mix(in_oklab,var(--color-fg),transparent_90%)]" />
        </div>
      </div>
    </header>
  );
}


