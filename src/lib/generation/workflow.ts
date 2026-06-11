import { callModalApi } from "@/lib/modal/client";
import type { Template } from "@/types";
import type { generateSchema } from "@/lib/validations/schemas";
import type { z } from "zod";

type GenerateInput = z.infer<typeof generateSchema>;

export type WorkflowResult = {
  outputImageUrl?: string;
  outputVideoUrl?: string;
  raw?: unknown;
};

type WorkflowArgs = {
  generationId: string;
  template: Template;
  payload: GenerateInput;
};

function normalizeModalResult(
  result: Awaited<ReturnType<typeof callModalApi<Record<string, unknown>>>>,
) {
  if (!result.ok) {
    return result;
  }

  const data = result.data;

  return {
    ok: true,
    data: {
      outputImageUrl:
        typeof data.outputImageUrl === "string"
          ? data.outputImageUrl
          : typeof data.imageUrl === "string"
            ? data.imageUrl
            : undefined,
      outputVideoUrl:
        typeof data.outputVideoUrl === "string"
          ? data.outputVideoUrl
          : typeof data.videoUrl === "string"
            ? data.videoUrl
            : undefined,
      raw: data,
    } satisfies WorkflowResult,
  } as const;
}

export async function executeTemplateWorkflow({
  generationId,
  template,
  payload,
}: WorkflowArgs) {
  const body = {
    generationId,
    templateId: template.id,
    assetIds: payload.assetIds,
    prompt: payload.prompt,
    inputImageUrl: payload.inputImageUrl,
    inputVideoUrl: payload.inputVideoUrl,
    inputText: payload.inputText,
    voiceId: payload.voiceId,
    quantity: payload.quantity,
  };

  if (template.kind === "image") {
    return normalizeModalResult(
      await callModalApi<Record<string, unknown>>({
        path: "/comfyui/flux-controlnet",
        body,
      }),
    );
  }

  if (template.kind === "video") {
    return normalizeModalResult(
      await callModalApi<Record<string, unknown>>({
        path: "/wan2.1/generate",
        body,
      }),
    );
  }

  if (template.kind === "virtual_tryon") {
    return normalizeModalResult(
      await callModalApi<Record<string, unknown>>({
        path: "/outfit-anyone/generate",
        body,
      }),
    );
  }

  const ttsResult = await callModalApi<Record<string, unknown>>({
    path: "/edge-tts",
    body: {
      generationId,
      text: payload.inputText,
      voiceId: payload.voiceId,
    },
  });

  if (!ttsResult.ok) {
    return ttsResult;
  }

  const audioUrl =
    typeof ttsResult.data.audioUrl === "string" ? ttsResult.data.audioUrl : null;

  if (!audioUrl) {
    return { ok: false, error: "Edge TTS 未返回 audioUrl" } as const;
  }

  return normalizeModalResult(
    await callModalApi<Record<string, unknown>>({
      path: "/wav2lip/sync",
      body: {
        ...body,
        audioUrl,
      },
    }),
  );
}
