import Skeleton from "./ui/Skeleton";

export default function LoadingState() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {[0,1,2].map((i) => (
        <div key={i} className="py-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="mt-4 space-y-3">
            {[0,1].map((r) => <Skeleton key={r} className="h-6 w-full" />)}
          </div>
        </div>
      ))}
    </div>
  );
}
