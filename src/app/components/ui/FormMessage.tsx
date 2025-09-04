import clsx from "clsx";

type Props = {
  message?: string | null;
  variant?: "error" | "success" | "info";
  className?: string;
};

export default function FormMessage({ message, variant = "error", className }: Props) {
  if (!message) return null;
  const colors =
    variant === "error"
      ? "text-[var(--color-danger)]"
      : variant === "success"
      ? "text-[var(--color-accent)]"
      : "text-[var(--color-muted)]";
  return <p className={clsx("text-sm", colors, className)}>{message}</p>;
}


