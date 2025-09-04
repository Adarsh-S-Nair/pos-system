"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Button from "../components/ui/Button";
import SetupGate from "../components/SetupGate";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      setEmail(session.user.email ?? null);
      setLoading(false);
    };
    void init();
  }, [router]);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[var(--color-muted)]">Loading your dashboard…</p>
      </main>
    );
  }

  return (
    <SetupGate>
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-sm text-[var(--color-muted)]">Signed in as {email}</p>
            </div>
            <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
          </div>
          <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="text-sm text-[var(--color-muted)]">This is a temporary dashboard page.</p>
          </div>
        </div>
      </main>
    </SetupGate>
  );
}


