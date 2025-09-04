interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse rounded-md bg-[color-mix(in_oklab,var(--color-fg),transparent_94%)] ${className}`} 
    />
  );
}
