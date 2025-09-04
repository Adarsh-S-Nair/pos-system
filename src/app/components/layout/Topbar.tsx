"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { LuMenu } from "react-icons/lu";
import { FaSearch } from "react-icons/fa";
import { Input } from "../ui/Input";

export default function Topbar() {
  const pathname = usePathname();
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;
      const name = (user.user_metadata?.name as string | undefined) || (user.user_metadata?.full_name as string | undefined) || user.email || "User";
      try {
        const { data: p } = await supabase
          .from("user_profiles")
          .select("profile_picture_url")
          .eq("user_id", user.id)
          .single();
        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&bold=true`;
        setProfileUrl(p?.profile_picture_url || fallback);
      } catch {
        setProfileUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&bold=true`);
      }
    };
    void load();
  }, []);
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
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" aria-hidden />
            <Input
              aria-label="Search"
              placeholder={`Search ${title}`}
              className="pl-9"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {profileUrl ? (
            <img src={profileUrl} alt="Profile" className="ml-2 h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="ml-2 h-8 w-8 rounded-full bg-[color-mix(in_oklab,var(--color-fg),transparent_90%)]" />
          )}
        </div>
      </div>
    </header>
  );
}


