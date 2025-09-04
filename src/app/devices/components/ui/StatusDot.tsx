interface StatusDotProps {
  tone: "success" | "warn" | "muted";
}

export default function StatusDot({ tone }: StatusDotProps) {
  const color = tone === "success" 
    ? "var(--color-accent)" 
    : tone === "warn" 
    ? "var(--color-warn)" 
    : "var(--color-muted)";
  
  const glow = `0 0 0 2px color-mix(in_oklab, ${color}, transparent 80%)`;
  
  return (
    <span 
      className="inline-block h-2 w-2 rounded-full" 
      style={{ backgroundColor: color, boxShadow: glow }} 
      aria-hidden 
    />
  );
}
