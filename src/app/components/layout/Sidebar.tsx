"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import Button from "../ui/Button";
import { supabase } from "../../lib/supabaseClient";
import {
  LuLayoutDashboard,
  LuReceipt,
  LuPackage,
  LuTags,
  LuMonitorSmartphone,
  LuUsers,
  LuStore,
} from "react-icons/lu";

export type Item = { href: string; label: string; icon?: React.ReactNode; badge?: string };

export const OPERATIONS: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LuLayoutDashboard className="h-4 w-4" /> },
  { href: "/transactions", label: "Transactions", icon: <LuReceipt className="h-4 w-4" /> },
];

export const CATALOG: Item[] = [
  { href: "/items", label: "Items", icon: <LuPackage className="h-4 w-4" /> },
  { href: "/categories", label: "Categories", icon: <LuTags className="h-4 w-4" /> },
];

export const DEVICES_STAFF: Item[] = [
  { href: "/devices", label: "Devices & Lanes", icon: <LuMonitorSmartphone className="h-4 w-4" /> },
  { href: "/staff", label: "Staff & PINs", icon: <LuUsers className="h-4 w-4" /> },
];

export const REPORTS: Item[] = [
  { href: "/reports/sales", label: "Sales Summary" },
];

export const SETTINGS: Item[] = [
  { href: "/settings/store", label: "Store Profile", icon: <LuStore className="h-4 w-4" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("You");
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        const name = (user.user_metadata?.name as string | undefined)
          || (user.user_metadata?.full_name as string | undefined);
        setDisplayName(name || user.email || "You");
      }
    };
    void load();
  }, []);

  const onLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/");
    setIsSigningOut(false);
  };

  const groups = useMemo(() => (
    [
      { title: "Operations", items: OPERATIONS },
      { title: "Catalog", items: CATALOG },
      { title: "Devices & Staff", items: DEVICES_STAFF },
      { title: "Reports", items: REPORTS },
      { title: "Settings", items: SETTINGS },
    ]
  ), []);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-[var(--color-bg)]">
      <div className="h-16 shrink-0 px-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)] grid place-items-center text-xs font-bold">C</div>
        <span className="text-sm font-semibold tracking-tight">Crate</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.title} className="mt-3 first:mt-0">
            <div className="px-2 text-[11px] uppercase tracking-wider text-[var(--color-muted)]">{g.title}</div>
            <ul className="mt-2 space-y-1">
              {g.items.map((it) => {
                const active = pathname.startsWith(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={clsx(
                        "group relative flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm",
                        "hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]",
                        active && "bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)] text-[var(--color-fg)]"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {it.icon}
                        <span>{it.label}</span>
                      </span>
                      {it.badge && (
                        <span className="ml-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted)]">{it.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="my-3 h-px w-full bg-[color-mix(in_oklab,var(--color-fg),transparent_92%)]" />
          </div>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <div className="rounded-lg bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[color-mix(in_oklab,var(--color-fg),transparent_90%)]" />
              <div>
                <div className="text-sm font-medium">{displayName}</div>
                <div className="text-xs text-[var(--color-muted)]">Signed in</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={onLogout} disabled={isSigningOut} className="w-full bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger),black_10%)]">
              {isSigningOut ? "Signing out…" : "Log out"}
            </Button>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-[var(--color-muted)]">© 2025 Crate Inc.</div>
      </div>
    </aside>
  );
}


