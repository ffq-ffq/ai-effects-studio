"use client";

import { useMutation } from "@tanstack/react-query";
import { requestGeneration, type GeneratePayload } from "@/lib/ai/generate";

export function useGenerate() {
  return useMutation({
    mutationFn: (payload: GeneratePayload) => requestGeneration(payload),
  });
}
