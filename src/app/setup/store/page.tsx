"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import FormMessage from "../../components/ui/FormMessage";
import { getLocalJSON, setLocalJSON } from "../../lib/storage";

type StoreProfile = {
  name: string;
  address1?: string;
  city?: string;
  region?: string;
  postal?: string;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

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

  const [name, setName] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postal, setPostal] = useState("");
  const [timezone, setTimezone] = useState(defaultTz);
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // If a profile already exists, skip this page
  useEffect(() => {
    const prof = getLocalJSON<Partial<StoreProfile>>("pos.storeProfile.v1");
    if (prof && prof.name && prof.timezone) {
      router.replace("/dashboard");
    }
  }, [router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Store name is required.");
      return;
    }
    if (!timezone) {
      setError("Timezone is required.");
      return;
    }
    setSaving(true);
    const now = new Date().toISOString();
    const profile: StoreProfile = {
      name: name.trim(),
      address1: address1.trim() || undefined,
      city: city.trim() || undefined,
      region: region.trim() || undefined,
      postal: postal.trim() || undefined,
      timezone,
      currency,
      createdAt: now,
      updatedAt: now,
    };
    setLocalJSON("pos.storeProfile.v1", profile);
    router.replace("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Set up your store</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">You can change these later in Settings.</p>
        </div>
        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm">Store name<span className="ml-1 text-[var(--color-danger)]">*</span></label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Crate Downtown" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Address (line 1)</label>
              <Input value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="123 Market St" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm">State/Province</label>
                <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="CA" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm">Postal code</label>
                <Input value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="94103" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm">Timezone<span className="ml-1 text-[var(--color-danger)]">*</span></label>
                <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="America/Los_Angeles" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm">Currency</label>
              <select
                className="block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <FormMessage variant="error" message={error} />
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>Save & Continue</Button>
              <Button type="button" variant="secondary" onClick={() => router.replace("/dashboard")}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}


