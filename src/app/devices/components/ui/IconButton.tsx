interface IconButtonProps {
  ariaLabel: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function IconButton({
  ariaLabel,
  onClick,
  children,
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={ariaLabel}
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] focus:outline-none focus-visible:ring-2 cursor-pointer"
    >
      {children}
    </button>
  );
}
