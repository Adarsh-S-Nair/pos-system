"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import FormMessage from "../../components/ui/FormMessage";
import { supabase } from "../../lib/supabaseClient";
import { useToast } from "../../components/ui/ToastProvider";

export default function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
    if (!firstName || !lastName || !email || !password) {
      setToast({
        title: "Missing information",
        description: !firstName ? "Enter your first name." : !lastName ? "Enter your last name." : !email ? "Enter your email." : "Enter your password.",
        variant: "warning",
      });
      return;
    }
    setIsLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&bold=true`;
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: fullName },
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (signUpError) {
      setError(null);
      setSuccess(null);
      setToast({ title: "Signup failed", description: signUpError.message, variant: "error" });
    } else {
      const userId = data?.user?.id;
      if (userId) {
        await supabase.from("user_profiles").upsert({ user_id: userId, profile_picture_url: avatarUrl });
      }
      setError(null);
      setSuccess(null);
      setToast({ title: "Welcome", description: "Account created.", variant: "success" });
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm text-[var(--color-muted)]">First name</label>
            <Input
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-sm text-[var(--color-muted)]">Last name</label>
            <Input
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
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
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Card>
  );
}


