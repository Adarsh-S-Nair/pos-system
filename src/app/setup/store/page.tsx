"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import FormMessage from "../../components/ui/FormMessage";
import Select from "../../components/ui/Select";
import { getLocalJSON, setLocalJSON } from "../../lib/storage";
import { supabase } from "../../lib/supabaseClient";

type Draft = {
  step: number;
  basics: { name: string; timezone: string; address1?: string; city?: string; region?: string; postal?: string; currency: string };
  taxes: { enabled: boolean; rate?: string };
  pins: { owner: string; manager?: string; cashier?: string };
  items: { choice?: "import" | "add" | "sample" };
};

const DRAFT_KEY = "pos.setupDraft.v1";

export default function StoreSetupPage() {
  const router = useRouter();
  const defaultTz = useMemo(() => {
    if (typeof window === "undefined") return "UTC";
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const initialDraft: Draft = useMemo(() => {
    const saved = getLocalJSON<Draft>(DRAFT_KEY);
    return (
      saved ?? {
        step: 0,
        basics: { name: "", timezone: defaultTz, address1: "", city: "", region: "", postal: "", currency: "USD" },
        taxes: { enabled: false, rate: "" },
        pins: { owner: "", manager: "", cashier: "" },
        items: { choice: undefined },
      }
    );
  }, [defaultTz]);

  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [error, setError] = useState<string | null>(null);

  // Persist draft on change
  useEffect(() => {
    setLocalJSON(DRAFT_KEY, draft);
  }, [draft]);

  // If a store profile already exists in DB, skip wizard
  useEffect(() => {
    const run = async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) return; // auth gate elsewhere
      const { data } = await supabase.from("business_profiles").select("id").limit(1);
      if ((data?.length ?? 0) > 0) router.replace("/dashboard");
    };
    void run();
  }, [router, supabase]);

  const focusFirst = (container: HTMLDivElement | null) => {
    container?.querySelector<HTMLInputElement | HTMLSelectElement>("input,select")?.focus();
  };
  const slideRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    focusFirst(slideRef.current ?? null);
  }, [draft.step]);

  const validateStep = useCallback(() => {
    setError(null);
    if (draft.step === 0) {
      if (!draft.basics.name.trim()) return "Store name is required.";
      if (!draft.basics.timezone) return "Timezone is required.";
    }
    if (draft.step === 1) {
      if (draft.taxes.enabled) {
        const r = Number(draft.taxes.rate);
        if (!Number.isFinite(r) || r < 0) return "Tax rate must be a number ≥ 0.";
      }
    }
    if (draft.step === 2) {
      const pinOk = (v: string | undefined, req = false) => {
        if (!v || v.length === 0) return !req;
        return /^\d{4,6}$/.test(v);
      };
      if (!pinOk(draft.pins.owner, true)) return "Owner PIN must be 4–6 digits.";
      if (!pinOk(draft.pins.manager)) return "Manager PIN must be 4–6 digits if provided.";
      if (!pinOk(draft.pins.cashier)) return "Cashier PIN must be 4–6 digits if provided.";
    }
    return null;
  }, [draft]);

  const canContinue = useMemo(() => validateStep() === null, [validateStep]);

  const onContinue = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      // focus first invalid
      slideRef.current?.querySelector<HTMLInputElement>("input[aria-invalid='true']")?.focus();
      return;
    }
    if (draft.step < 3) {
      setDraft((d) => ({ ...d, step: d.step + 1 }));
    } else {
      // Final submit: write to DB (owner-only via RLS; owner_id from auth.uid())
      const { error: upsertError } = await supabase.from("business_profiles").insert({
        name: draft.basics.name.trim(),
        address1: draft.basics.address1?.trim() || null,
        city: draft.basics.city?.trim() || null,
        region: draft.basics.region?.trim() || null,
        postal: draft.basics.postal?.trim() || null,
        timezone: draft.basics.timezone,
        currency: draft.basics.currency,
      });
      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      setLocalJSON(DRAFT_KEY, null as unknown as string); // clear draft
      router.replace("/dashboard");
    }
  };

  const onBack = () => setDraft((d) => ({ ...d, step: Math.max(0, d.step - 1) }));
  const onCancel = () => router.replace("/dashboard");

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (canContinue) onContinue();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (canContinue) onContinue();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canContinue, onBack, onCancel, onContinue]);

  // Slide container styles
  const slideStyle = (index: number) => {
    const offset = (index - draft.step) * 100;
    return {
      transform: `translateX(${offset}%)`,
      opacity: index === draft.step ? 1 : 0,
      transition: "transform 280ms ease-out, opacity 200ms ease-out",
      position: "absolute" as const,
      inset: 0,
    };
  };

  const StepHeader = (
    <header className="mx-auto w-full max-w-4xl px-8 pt-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Set up your store</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">You can change these later in Settings.</p>
      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-[var(--color-muted)]">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-2 w-2 rounded-full border border-[var(--color-border)] ${draft.step === i ? "bg-[var(--color-fg)]" : "bg-[var(--color-surface)]"}`} />
          ))}
        </div>
        <span>Step {draft.step + 1} of 4</span>
      </div>
    </header>
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden flex flex-col">
      {StepHeader}
      <div className="flex-1 flex items-center justify-center">
        <section className="w-full max-w-3xl px-10 pb-24 pt-4">
          <div className="relative overflow-hidden min-h-[420px] px-6 sm:px-8 md:px-10" ref={slideRef}>
            {/* Step 1: Basics */}
            <div style={slideStyle(0)}>
              <div className="space-y-4 px-2 md:px-4">
                <div className="space-y-1.5">
                  <label className="text-sm">Store name<span className="ml-1 text-[var(--color-danger)]">*</span></label>
                  <Input aria-invalid={!draft.basics.name ? "true" : undefined} value={draft.basics.name} onChange={(e) => setDraft((d) => ({ ...d, basics: { ...d.basics, name: e.target.value } }))} placeholder="Crate Downtown" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm">Timezone<span className="ml-1 text-[var(--color-danger)]">*</span></label>
                  <Input aria-invalid={!draft.basics.timezone ? "true" : undefined} value={draft.basics.timezone} onChange={(e) => setDraft((d) => ({ ...d, basics: { ...d.basics, timezone: e.target.value } }))} placeholder="America/Los_Angeles" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm">Address (line 1)</label>
                  <Input value={draft.basics.address1} onChange={(e) => setDraft((d) => ({ ...d, basics: { ...d.basics, address1: e.target.value } }))} placeholder="123 Market St" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm">City</label>
                    <Input value={draft.basics.city} onChange={(e) => setDraft((d) => ({ ...d, basics: { ...d.basics, city: e.target.value } }))} placeholder="San Francisco" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm">State/Province</label>
                    <Input value={draft.basics.region} onChange={(e) => setDraft((d) => ({ ...d, basics: { ...d.basics, region: e.target.value } }))} placeholder="CA" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm">Postal code</label>
                    <Input value={draft.basics.postal} onChange={(e) => setDraft((d) => ({ ...d, basics: { ...d.basics, postal: e.target.value } }))} placeholder="94103" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm">Currency</label>
                    <Select value={draft.basics.currency} onChange={(e) => setDraft((d) => ({ ...d, basics: { ...d.basics, currency: e.target.value } }))}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="JPY">JPY</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Taxes */}
            <div style={slideStyle(1)}>
              <div className="space-y-4 px-2 md:px-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Enable taxes</label>
                  <input className="cursor-pointer" type="checkbox" checked={draft.taxes.enabled} onChange={(e) => setDraft((d) => ({ ...d, taxes: { ...d.taxes, enabled: e.target.checked } }))} />
                </div>
                {draft.taxes.enabled && (
                  <div className="space-y-1.5">
                    <label className="text-sm">Default rate (%)</label>
                    <Input aria-invalid={draft.taxes.enabled && (!draft.taxes.rate || Number(draft.taxes.rate) < 0) ? "true" : undefined} value={draft.taxes.rate ?? ""} onChange={(e) => setDraft((d) => ({ ...d, taxes: { ...d.taxes, rate: e.target.value } }))} placeholder="7.5" />
                    <p className="text-xs text-[var(--color-muted)]">Applies at checkout by default. You can override per item later.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Staff & PINs */}
            <div style={slideStyle(2)}>
              <div className="space-y-4 px-2 md:px-4">
                <div className="space-y-1.5">
                  <label className="text-sm">Owner PIN<span className="ml-1 text-[var(--color-danger)]">*</span></label>
                  <Input aria-invalid={!/^\d{4,6}$/.test(draft.pins.owner || "") ? "true" : undefined} value={draft.pins.owner} onChange={(e) => setDraft((d) => ({ ...d, pins: { ...d.pins, owner: e.target.value } }))} placeholder="4–6 digits" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm">Manager PIN</label>
                  <Input aria-invalid={!!draft.pins.manager && !/^\d{4,6}$/.test(draft.pins.manager) ? "true" : undefined} value={draft.pins.manager} onChange={(e) => setDraft((d) => ({ ...d, pins: { ...d.pins, manager: e.target.value } }))} placeholder="optional" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm">Cashier PIN</label>
                  <Input aria-invalid={!!draft.pins.cashier && !/^\d{4,6}$/.test(draft.pins.cashier) ? "true" : undefined} value={draft.pins.cashier} onChange={(e) => setDraft((d) => ({ ...d, pins: { ...d.pins, cashier: e.target.value } }))} placeholder="optional" />
                </div>
                <p className="text-xs text-[var(--color-muted)]">You can configure roles and permissions later.</p>
              </div>
            </div>

            {/* Step 4: Items */}
            <div style={slideStyle(3)}>
              <div className="space-y-4 px-2 md:px-4">
                <p className="text-sm">How would you like to add items?</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <button type="button" className={`rounded-md border border-[var(--color-border)] p-4 text-sm cursor-pointer hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_5%)] ${draft.items.choice === "import" ? "outline outline-2 outline-[var(--color-ring)]" : ""}`} onClick={() => setDraft((d) => ({ ...d, items: { choice: "import" } }))}>Import CSV</button>
                  <button type="button" className={`rounded-md border border-[var(--color-border)] p-4 text-sm cursor-pointer hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_5%)] ${draft.items.choice === "add" ? "outline outline-2 outline-[var(--color-ring)]" : ""}`} onClick={() => setDraft((d) => ({ ...d, items: { choice: "add" } }))}>Add a few</button>
                  <button type="button" className={`rounded-md border border-[var(--color-border)] p-4 text-sm cursor-pointer hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_5%)] ${draft.items.choice === "sample" ? "outline outline-2 outline-[var(--color-ring)]" : ""}`} onClick={() => setDraft((d) => ({ ...d, items: { choice: "sample" } }))}>Load sample</button>
                </div>
                <p className="text-xs text-[var(--color-muted)]">You can import or build your catalog later; this is just to get you started.</p>
              </div>
            </div>
          </div>

          {error && <div className="px-2 md:px-0"><FormMessage variant="error" message={error} /></div>}
        </section>
      </div>

      {/* Fixed footer actions */}
      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-8 py-4">
          <Button variant="secondary" onClick={onBack} disabled={draft.step === 0}>Back</Button>
          <Button onClick={onContinue} disabled={!canContinue}>{draft.step === 3 ? "Save & Finish" : "Continue"}</Button>
        </div>
      </footer>
    </main>
  );
}


