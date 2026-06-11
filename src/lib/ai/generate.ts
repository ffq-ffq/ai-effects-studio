import type { GenerationMode } from "@/types";

export type GeneratePayload = {
  generationId?: string;
  templateId: string;
  assetIds: string[];
  mode: GenerationMode;
  prompt?: string;
  projectId?: string;
  inputImageUrl?: string;
  inputVideoUrl?: string;
  inputText?: string;
  voiceId?: string;
  quantity?: number;
  platformTargets?: string[];
};

export async function requestGeneration(payload: GeneratePayload) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    return {
      ok: false,
      error:
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : `Generation API failed with ${response.status}`,
    } as const;
  }

  return data as {
    ok: boolean;
    data?: {
      generationId: string;
      status: string;
      creditsCost: number;
      outputImageUrl?: string;
      outputVideoUrl?: string;
    };
    error?: string;
  };
}
