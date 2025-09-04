"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

type Props = {
  length?: number;
  value: string;
  onChange: (v: string) => void;
};

export default function OTPInput({ length = 6, value, onChange }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, length);
  }, [length]);

  const setChar = (idx: number, ch: string) => {
    const clean = ch.replace(/\D/g, "");
    if (!clean) return;
    const arr = value.split("");
    arr[idx] = clean[0];
    const next = arr.join("");
    onChange(next.slice(0, length));
    if (idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const onBackspace = (idx: number) => {
    if (value[idx]) {
      const arr = value.split("");
      arr[idx] = "";
      onChange(arr.join(""));
    } else if (idx > 0) {
      refs.current[idx - 1]?.focus();
      const arr = value.split("");
      arr[idx - 1] = "";
      onChange(arr.join(""));
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => setChar(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              onBackspace(i);
            }
          }}
          className={clsx(
            "h-12 w-10 rounded-md border text-center text-lg",
            "bg-[var(--color-input-bg)] text-[var(--color-input-fg)] border-[var(--color-border)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:border-transparent"
          )}
        />
      ))}
    </div>
  );
}


