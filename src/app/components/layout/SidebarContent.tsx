"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import ThemeToggle from "../ThemeToggle";
import Button from "../ui/Button";
import { supabase } from "../../lib/supabaseClient";
import { NAV_GROUPS } from "./nav";
import { FaLock } from "react-icons/fa";

export default function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>("You");
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        const name = (user.user_metadata?.name as string | undefined) || (user.user_metadata?.full_name as string | undefined);
        setDisplayName(name || user.email || "You");

        const { data: p } = await supabase
          .from("user_profiles")
          .select("profile_picture_url")
          .eq("user_id", user.id)
          .maybeSingle();
        const fallbackName = name || user.email || "User";
        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&bold=true`;
        setProfileUrl(p?.profile_picture_url || fallback);
      }

      const { data: biz } = await supabase.from("business_profiles").select("name").limit(1).maybeSingle();
      setBusinessName(biz?.name || "");
    };
    void load();
  }, []);

  const groups = useMemo(() => NAV_GROUPS, []);

  const onLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    onNavigate?.();
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
        {groups.map((g) => (
          <div key={g.title} className="mt-3 first:mt-0">
            <div className="px-2 text-[11px] uppercase tracking-wider text-[var(--color-muted)]">{g.title}</div>
            <ul className="mt-2 space-y-1">
              {g.items.map((it) => {
                const active = pathname.startsWith(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.disabled ? "#" : it.href}
                      onClick={(e) => {
                        if (it.disabled) {
                          e.preventDefault();
                          return;
                        }
                        onNavigate?.();
                      }}
                      aria-disabled={it.disabled || undefined}
                      className={clsx(
                        "group relative flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm",
                        it.disabled
                          ? "cursor-not-allowed text-[color-mix(in_oklab,var(--color-muted),var(--color-bg)_40%)] opacity-70"
                          : "hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]",
                        active && !it.disabled && "bg-[color-mix(in_oklab,var(--color-fg),transparent_96%)] text-[var(--color-fg)]"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={it.disabled ? "opacity-40" : undefined}>{it.icon}</span>
                        <span className={it.disabled ? "text-[color-mix(in_oklab,var(--color-muted),var(--color-bg)_40%)]" : undefined}>{it.label}</span>
                      </span>
                      {it.disabled && <FaLock className="h-3.5 w-3.5 text-[color-mix(in_oklab,var(--color-muted),var(--color-bg)_40%)]" />}
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
              {profileUrl ? (
                <img src={profileUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[color-mix(in_oklab,var(--color-fg),transparent_90%)]" />
              )}
              <div>
                <div className="text-sm font-medium">{displayName}</div>
                <div className="text-xs text-[var(--color-muted)]">{businessName || ""}</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={onLogout} className="w-full bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger),black_10%)]">Log out</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


