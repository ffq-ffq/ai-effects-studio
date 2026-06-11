"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useGenerate } from "@/hooks/use-generate";
import type { GenerationRealtimePayload } from "@/hooks/use-generation-realtime";
import type { Template } from "@/types";

type GeneratePanelProps = {
  selectedTemplate?: Template;
  onGenerationStart?: (generation: GenerationRealtimePayload) => void;
  onGenerationUpdate?: (generation: GenerationRealtimePayload) => void;
};

function waitForRealtimeSubscription() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 120);
  });
}

export function GeneratePanel({
  selectedTemplate,
  onGenerationStart,
  onGenerationUpdate,
}: GeneratePanelProps) {
  const [prompt, setPrompt] = useState("");
  const generate = useGenerate();

  async function handleGenerate() {
    if (!selectedTemplate || generate.isPending) {
      return;
    }

    const generationId = crypto.randomUUID();
    onGenerationStart?.({
      id: generationId,
      status: "queued",
      progress: 0,
      phase: "queued",
      message: "排队中",
      retryCount: 0,
    });

    await waitForRealtimeSubscription();

    const result = await generate.mutateAsync({
      generationId,
      templateId: selectedTemplate.id,
      assetIds: [`demo-asset-${generationId}`],
      mode: selectedTemplate.mode,
      prompt: prompt.trim() || undefined,
    });

    if (!result.ok) {
      onGenerationUpdate?.({
        id: generationId,
        status: "failed",
        progress: 100,
        phase: "failed",
        message: "生成失败",
        errorMessage: result.error ?? "Generation failed",
      });
      return;
    }

    if (result.data) {
      onGenerationUpdate?.({
        id: result.data.generationId,
        status: result.data.status === "completed" ? "completed" : "generating",
        progress: result.data.status === "completed" ? 100 : 85,
        phase: result.data.status === "completed" ? "completed" : "generating",
        message: result.data.status === "completed" ? "已完成" : "生成中",
        outputImageUrl: result.data.outputImageUrl,
        outputVideoUrl: result.data.outputVideoUrl,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成设置</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Textarea
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="补充商品卖点、风格或活动信息"
          value={prompt}
        />
        <Button
          disabled={!selectedTemplate || generate.isPending}
          onClick={handleGenerate}
          type="button"
        >
          <WandSparkles className="size-4" />
          {generate.isPending ? "生成中..." : "一键生成"}
          {selectedTemplate ? ` · ${selectedTemplate.creditCost} credits` : ""}
        </Button>
      </CardContent>
    </Card>
  );
}
