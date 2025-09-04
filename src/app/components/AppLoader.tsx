"use client";

import { useStore } from "../contexts/StoreContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AppLoaderProps {
  children: React.ReactNode;
}

export default function AppLoader({ children }: AppLoaderProps) {
  const { loading, error, storeId } = useStore();
  const router = useRouter();

  // Redirect to setup if no business profile
  useEffect(() => {
    if (!loading && storeId === null && !error) {
      router.replace("/setup/store");
    }
  }, [loading, storeId, error, router]);

  // Show loading only on initial app load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-[var(--color-muted)]">Loading…</div>
      </div>
    );
  }

  // Show error if there's a problem
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting to setup
  if (storeId === null) {
    return null;
  }

  return <>{children}</>;
}
