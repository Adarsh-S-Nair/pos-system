"use client";

import { PropsWithChildren, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSetupStatus } from "../hooks/useSetupStatus";

// Client gate: checks if store profile exists, otherwise redirect to setup.
export default function SetupGate({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasStore, checked } = useSetupStatus();

  useEffect(() => {
    if (!checked) return; // wait for client check
    if (!hasStore) {
      if (pathname !== "/setup/store") {
        router.replace("/setup/store");
      }
    }
  }, [checked, hasStore, router, pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-[var(--color-muted)]">Loading…</div>
      </div>
    );
  }

  if (!hasStore && pathname !== "/setup/store") {
    // During replace, render minimal placeholder to avoid flicker
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-[var(--color-muted)]">Redirecting…</div>
      </div>
    );
  }

  return <>{children}</>;
}


