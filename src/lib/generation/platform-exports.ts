import { exportPlatformSizes } from "@/lib/utils";

export function createPlatformExports(targets?: string[]) {
  const targetSet = targets?.length ? new Set(targets) : null;

  return exportPlatformSizes
    .filter((size) => !targetSet || targetSet.has(size.id))
    .map((size) => ({
      ...size,
      status: "queued",
      storagePath: null,
    }));
}
