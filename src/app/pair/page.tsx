"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import OTPInput from "../components/ui/OTPInput";
import BackLink from "../components/BackLink";
import { supabase } from "../lib/supabaseClient";

export default function PairPage() {
  const router = useRouter();
  const [pin, setPin] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const valid = pin.length === 6;

  const normalized = useMemo(() => pin.toUpperCase(), [pin]);

  const submit = useCallback(async (code: string) => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // Check pairing_codes validity: not expired, not claimed
      const { data, error: err } = await supabase
        .from("pairing_codes")
        .select("id, expires_at")
        .eq("code", code)
        .is("claimed_at", null)
        .limit(1)
        .maybeSingle();
      if (err) throw err;
      if (!data) {
        setError("Invalid or expired code. Try again.");
        return;
      }
      const exp = new Date(data.expires_at).getTime();
      if (Date.now() > exp) {
        setError("Code expired. Generate a new one.");
        return;
      }
      // Success: navigate to temporary authenticated page
      router.push("/pair/success");
    } catch (e) {
      setError("Unable to verify code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [router, submitting]);

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-16">
      <BackLink />
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Pair a register</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Enter the pairing code shown on the register.</p>
        <div className="mt-6">
          <OTPInput 
            value={pin} 
            onChange={(v) => { setPin(v); setError(""); }} 
            onComplete={(v) => submit(v.toUpperCase())}
            length={6} 
            mode="alphanumeric" 
            uppercase 
          />
          {error ? <p className="mt-3 text-sm text-[var(--color-warn)]">{error}</p> : null}
          <Button className="mt-6 w-full" disabled={!valid || submitting} onClick={() => submit(normalized)}>
            Pair
          </Button>
        </div>
      </div>
    </main>
  );
}


