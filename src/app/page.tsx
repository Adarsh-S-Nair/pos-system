import Button from "./components/ui/Button";
import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 w-full bg-[var(--color-bg)]">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
          <div className="text-sm font-semibold">Crate</div>
          <nav className="hidden sm:flex" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth"><Button className="gap-2">Log in</Button></Link>
            <Link href="/pair"><Button variant="ghost" className="gap-2">Pair register</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative isolate flex flex-1 items-center justify-center px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.04),transparent),radial-gradient(ellipse_at_top,rgba(17,24,39,0.06),transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-muted)]">
            Launching new POS features
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
            Point of sale that feels effortless
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
            Streamline your workflows with a modern POS. Built for teams who value speed, reliability, and a clean, minimal interface.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/auth"><Button>Start for free</Button></Link>
            <Link href="/auth"><Button variant="secondary">Book a demo</Button></Link>
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">No credit card required • Free 14‑day trial</p>
        </div>
      </section>
    </main>
  );
}
