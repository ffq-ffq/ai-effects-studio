import { exportPlatformSizes, formatPlatformSize } from "@/lib/utils";

export function MultiPlatformExport() {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {exportPlatformSizes.map((size) => (
        <div className="rounded-md border bg-card p-3 text-sm" key={size.id}>
          <p className="font-medium">{size.label}</p>
          <p className="mt-1 text-muted-foreground">
            {formatPlatformSize(size)}
          </p>
        </div>
      ))}
    </div>
  );
}
