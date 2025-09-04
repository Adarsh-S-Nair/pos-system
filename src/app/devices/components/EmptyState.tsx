import Button from "../../components/ui/Button";

interface EmptyStateProps {
  onCreateLane: () => void;
}

export default function EmptyState({ onCreateLane }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="h-24 w-24 rounded-xl bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)]" aria-hidden />
      </div>
      <h3 className="mt-6 text-lg font-semibold">No lanes yet</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Create your first lane and start pairing devices.
      </p>
      <Button className="mt-4" onClick={onCreateLane}>
        Create lane
      </Button>
    </div>
  );
}
