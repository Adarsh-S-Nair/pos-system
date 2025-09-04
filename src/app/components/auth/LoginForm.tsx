"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormMessage from "../../components/ui/FormMessage";
import { useToast } from "../../components/ui/ToastProvider";
import { supabase } from "../../lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { setToast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setToast({
        title: "Missing information",
        description: !email && !password ? "Enter your email and password." : !email ? "Enter your email." : "Enter your password.",
        variant: "warning",
      });
      return;
    }
    setIsLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(null);
      setSuccess(null);
      setToast({
        title: "Sign in failed",
        description: signInError.message,
        variant: "error",
      });
    } else {
      setError(null);
      setSuccess(null);
      setToast({
        title: "Welcome back",
        description: "Signed in successfully.",
        variant: "success",
      });
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label className="text-sm text-[var(--color-muted)]">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-[var(--color-muted)]">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <FormMessage variant="error" message={error} />
        <FormMessage variant="success" message={success} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}


