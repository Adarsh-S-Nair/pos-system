"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import OTPInput from "../components/ui/OTPInput";
import BackLink from "../components/BackLink";
import { supabase } from "../lib/supabaseClient";
import { useToast } from "../components/ui/ToastProvider";

export default function PairPage() {
  const router = useRouter();
  const [pin, setPin] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { setToast } = useToast();
  const valid = pin.length === 6;

  const normalized = useMemo(() => pin.toUpperCase(), [pin]);

  const submit = useCallback(async (code: string) => {
    if (submitting) return;
    setSubmitting(true);
    console.debug("[pair] submit called", { code });
    try {
      // Server-side validation to bypass RLS via SECURITY DEFINER function
      const { data, error: err } = await supabase.rpc("verify_pairing_code", { p_code: code });
      console.debug("[pair] verify_pairing_code result", { data, err });
      if (err) throw err;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setToast({ title: "Invalid or expired code", description: "Try again.", variant: "error" });
        return;
      }
      // Success: navigate to temporary authenticated page
      router.push("/pair/success");
    } catch (e) {
      console.debug("[pair] verification error", e);
      setToast({ title: "Unable to verify code", description: "Please try again.", variant: "error" });
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
            onChange={(v) => { setPin(v); }} 
            onComplete={(v) => submit(v.toUpperCase())}
            length={6} 
            mode="alphanumeric" 
            uppercase 
          />
          <Button className="mt-6 w-full" disabled={!valid || submitting} onClick={() => submit(normalized)}>
            Pair
          </Button>
        </div>
      </div>
    </main>
  );
}


