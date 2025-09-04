"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const btn = document.getElementById("sidebar-toggle");
    const handler = () => setOpen((v) => !v);
    btn?.addEventListener("click", handler);
    return () => btn?.removeEventListener("click", handler);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 bg-[var(--color-content-bg)]">
        <Topbar />
        <main className="mx-auto max-w-[1400px] px-4 py-6">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="drawer"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.7 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-bg)] shadow-lg lg:hidden overflow-y-auto"
            >
              <MobileSidebar onNavigate={() => setOpen(false)} />
            </motion.div>
            <motion.button
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileSidebar({ onNavigate }: { onNavigate: () => void }) {
  // Lightweight sidebar rendering reusing the same groups
  const modules = require("./Sidebar");
  const { OPERATIONS, CATALOG, DEVICES_STAFF, REPORTS, SETTINGS } = modules;
  const groups = [
    { title: "Operations", items: OPERATIONS },
    { title: "Catalog", items: CATALOG },
    { title: "Devices & Staff", items: DEVICES_STAFF },
    { title: "Reports", items: REPORTS },
    { title: "Settings", items: SETTINGS },
  ];
  const { usePathname } = require("next/navigation");
  const pathname: string = usePathname();
  const Link = require("next/link").default;
  const clsx = require("clsx");
  const ThemeToggle = require("../ThemeToggle").default;
  const supabase = require("../../lib/supabaseClient").supabase;
  const React = require("react");
  const { useEffect, useState } = React;
  const { useRouter } = require("next/navigation");
  const Button = require("../ui/Button").default;
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

  const router = useRouter();
  const onLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    onNavigate();
    router.replace("/");
    setIsSigningOut(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="h-16 shrink-0 px-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-[var(--color-primary)] text-[var(--color-on-primary)] grid place-items-center text-xs font-bold">C</div>
        <span className="text-sm font-semibold tracking-tight">Crate</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g: any) => (
          <div key={g.title} className="mt-3 first:mt-0">
            <div className="px-2 text-[11px] uppercase tracking-wider text-[var(--color-muted)]">{g.title}</div>
            <ul className="mt-2 space-y-1">
              {g.items.map((it: any) => {
                const active = pathname.startsWith(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
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
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="my-3 h-px w-full bg-[color-mix(in_oklab,var(--color-fg),transparent_92%)]" />
          </div>
        ))}
      </nav>
      <div className="p-3 pt-0">
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
          <div className="mt-3">
            <Button
              onClick={onLogout}
              disabled={isSigningOut}
              className="w-full bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger),black_10%)]"
            >
              {isSigningOut ? "Signing out…" : "Log out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


