import Tabs from "./components/ui/Tabs";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-muted)]">
            Crate
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Sign in or create an account</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Modern POS for sales and inventory</p>
        </div>
        <Tabs
          tabs={[
            { key: "login", label: "Sign in", content: <LoginForm /> },
            { key: "signup", label: "Create account", content: <SignupForm /> },
          ]}
          initialKey="login"
        />
        <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
