import { PropsWithChildren } from "react";
import clsx from "clsx";

type CardProps = PropsWithChildren<{
  className?: string;
  padded?: boolean;
}>;

export default function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}


