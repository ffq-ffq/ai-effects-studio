import type { SupabaseClient } from "@supabase/supabase-js";
import type { GenerationStatus } from "@/types";

export type GenerationRealtimePayload = {
  id: string;
  status: GenerationStatus;
  progress: number;
  phase: "queued" | "generating" | "post_processing" | "completed" | "failed";
  message: string;
  retryCount?: number;
  errorMessage?: string | null;
  outputImageUrl?: string | null;
  outputVideoUrl?: string | null;
};

const progressMessages: Record<GenerationRealtimePayload["phase"], string> = {
  queued: "排队中",
  generating: "生成中",
  post_processing: "后处理中",
  completed: "已完成",
  failed: "生成失败",
};

export function getGenerationPhase(
  status: GenerationStatus,
): GenerationRealtimePayload["phase"] {
  if (status === "post_processing") return "post_processing";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "generating") return "generating";
  return "queued";
}

export async function broadcastGenerationProgress(
  supabase: SupabaseClient,
  payload: Omit<GenerationRealtimePayload, "phase" | "message"> & {
    phase?: GenerationRealtimePayload["phase"];
    message?: string;
  },
) {
  const phase = payload.phase ?? getGenerationPhase(payload.status);
  const message = payload.message ?? progressMessages[phase];
  const channel = supabase.channel(`generation:${payload.id}`);

  try {
    await channel.send({
      type: "broadcast",
      event: "progress",
      payload: {
        ...payload,
        phase,
        message,
      } satisfies GenerationRealtimePayload,
    });
  } catch {
    // Realtime progress is best-effort; the database record remains the source of truth.
  } finally {
    await supabase.removeChannel(channel);
  }
}
