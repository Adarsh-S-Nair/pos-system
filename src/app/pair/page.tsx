"use client";

import { useState } from "react";
import Button from "../components/ui/Button";
import OTPInput from "../components/ui/OTPInput";

export default function PairPage() {
  const [pin, setPin] = useState<string>("");
  const valid = pin.length >= 4;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Pair a register</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Enter the pairing code shown on the register.</p>
        <div className="mt-6">
          <OTPInput value={pin} onChange={setPin} length={6} />
          <Button className="mt-6 w-full" disabled={!valid}>Continue</Button>
        </div>
      </div>
    </main>
  );
}


