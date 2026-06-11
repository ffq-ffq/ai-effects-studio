import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4", className)}>
      <Skeleton className="h-9 w-44 rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl md:col-span-2" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export function FullPageLoadingSkeleton() {
  return (
    <main className="min-h-[calc(100svh-5rem)] w-full px-3 py-4 sm:px-4 lg:px-6">
      <div className="mx-auto grid w-full max-w-[1800px] gap-4">
        <div className="rounded-lg border border-[#171510]/10 bg-white/60 p-4 shadow-[0_14px_40px_rgba(23,21,16,0.07)]">
          <LoadingSkeleton />
        </div>
      </div>
    </main>
  );
}
