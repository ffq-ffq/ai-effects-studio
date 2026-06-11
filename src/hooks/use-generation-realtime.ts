"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { GenerationRealtimePayload } from "@/lib/generation/realtime";

export type { GenerationRealtimePayload };

export function useGenerationRealtime(
  generationId: string | undefined,
  onUpdate: (generation: GenerationRealtimePayload) => void,
) {
  useEffect(() => {
    if (!generationId) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`generation:${generationId}`)
      .on("broadcast", { event: "progress" }, (payload) => {
        onUpdate(payload.payload as GenerationRealtimePayload);
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "generations",
          filter: `id=eq.${generationId}`,
        },
        (payload) => {
          const generation = payload.new as {
            id: string;
            status: GenerationRealtimePayload["status"];
            progress: number;
            error_message?: string | null;
            output_image_url?: string | null;
            output_video_url?: string | null;
            retry_count?: number;
          };

          onUpdate({
            id: generation.id,
            status: generation.status,
            progress: generation.progress,
            phase:
              generation.status === "post_processing"
                ? "post_processing"
                : generation.status === "completed"
                  ? "completed"
                  : generation.status === "failed"
                    ? "failed"
                    : generation.status === "generating"
                      ? "generating"
                      : "queued",
            message: "进度已更新",
            retryCount: generation.retry_count,
            errorMessage: generation.error_message,
            outputImageUrl: generation.output_image_url,
            outputVideoUrl: generation.output_video_url,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [generationId, onUpdate]);
}
