import { callModalApi } from "@/lib/modal/client";

export async function requestLipSync(videoAssetId: string, script: string) {
  return callModalApi<{ jobId: string }>({
    path: "/lip-sync",
    body: { videoAssetId, script },
  });
}
