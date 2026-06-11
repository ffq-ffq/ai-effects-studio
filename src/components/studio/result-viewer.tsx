"use client";

import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GenerationRealtimePayload } from "@/hooks/use-generation-realtime";
import { cn } from "@/lib/utils";

const statusLabels: Record<GenerationRealtimePayload["status"], string> = {
  pending: "等待中",
  queued: "排队中",
  generating: "生成中",
  post_processing: "后处理中",
  completed: "已完成",
  failed: "失败",
};

function StatusIcon({ status }: { status: GenerationRealtimePayload["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 className="size-4 text-emerald-600" />;
  }

  if (status === "failed") {
    return <XCircle className="size-4 text-red-600" />;
  }

  if (status === "queued" || status === "pending") {
    return <Clock3 className="size-4 text-[#9a641d]" />;
  }

  return <Loader2 className="size-4 animate-spin text-[#9a641d]" />;
}

function GeneratingPlaceholder({ progress }: { progress: number }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#171510]/10 bg-[#f8f0df] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.22),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(251,113,133,0.18),transparent_30%)]" />
      <div className="relative grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#171510]">正在生成预览</p>
            <p className="mt-1 text-xs text-[#171510]/56">
              AI 正在锁定产品轮廓、匹配模板风格并生成平台尺寸。
            </p>
          </div>
          <span className="font-mono text-sm font-semibold text-[#9a641d]">
            {progress}%
          </span>
        </div>
        <div className="grid aspect-video place-items-center rounded-md bg-white/60">
          <div className="grid gap-3 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#171510] text-white shadow-[0_16px_40px_rgba(23,21,16,0.20)]">
              <Loader2 className="size-7 animate-spin" />
            </div>
            <div className="mx-auto grid w-56 gap-2">
              <span className="h-3 animate-pulse rounded-full bg-[#d7bd7a]/70" />
              <span className="h-3 w-3/4 animate-pulse rounded-full bg-[#d96b4f]/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultViewer({
  generation,
  onRetry,
}: {
  generation?: GenerationRealtimePayload;
  onRetry?: () => void;
}) {
  const isWorking =
    generation &&
    !["completed", "failed"].includes(generation.status) &&
    !generation.outputImageUrl &&
    !generation.outputVideoUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成结果</CardTitle>
      </CardHeader>
      <CardContent>
        {!generation ? (
          <EmptyState
            title="还没有生成结果"
            description="点击开始生成后，这里会实时显示排队、生成、后处理和完成状态。"
          />
        ) : generation.status === "failed" ? (
          <ErrorState
            title="生成失败"
            message={generation.errorMessage || "生成失败，已触发失败保护流程。"}
            onRetry={onRetry}
          />
        ) : (
          <div className="grid gap-4">
            <div className="rounded-lg border border-[#171510]/10 bg-[#f8f4ea] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <StatusIcon status={generation.status} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#171510]">
                      {generation.message || statusLabels[generation.status]}
                    </p>
                    <p className="truncate text-xs text-[#171510]/48">
                      Channel: generation:{generation.id}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
                    generation.status === "completed"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-[#efe1b9] text-[#7a4d12]",
                  )}
                >
                  {statusLabels[generation.status]}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-between text-xs text-[#171510]/54">
                  <span>{generation.phase}</span>
                  <span>{generation.progress}%</span>
                </div>
                <Progress value={generation.progress} />
              </div>
              {generation.retryCount ? (
                <p className="mt-3 text-xs text-[#171510]/54">
                  自动重试第 {generation.retryCount} 次
                </p>
              ) : null}
            </div>

            {isWorking ? (
              <GeneratingPlaceholder progress={generation.progress} />
            ) : null}

            {generation.outputImageUrl ? (
              <div className="overflow-hidden rounded-lg border border-[#171510]/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="生成结果"
                  className="aspect-video w-full object-cover"
                  src={generation.outputImageUrl}
                />
              </div>
            ) : null}

            {generation.outputVideoUrl ? (
              <video
                className="w-full rounded-lg border border-[#171510]/10"
                controls
                src={generation.outputVideoUrl}
              />
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
