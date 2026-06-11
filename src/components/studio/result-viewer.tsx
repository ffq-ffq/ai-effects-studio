"use client";

import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
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
  if (status === "completed") return <CheckCircle2 className="size-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="size-4 text-destructive" />;
  if (status === "queued" || status === "pending") return <Clock3 className="size-4 text-muted-foreground" />;
  return <Loader2 className="size-4 animate-spin text-primary" />;
}

export function ResultViewer({
  generation,
}: {
  generation?: GenerationRealtimePayload;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>生成结果</CardTitle>
      </CardHeader>
      <CardContent>
        {!generation ? (
          <EmptyState
            title="还没有结果"
            description="点击生成后会实时显示排队、生成、后处理和完成状态。"
          />
        ) : (
          <div className="grid gap-4">
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <StatusIcon status={generation.status} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {generation.message || statusLabels[generation.status]}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Channel: generation:{generation.id}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-1 text-xs font-medium",
                    generation.status === "failed"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {statusLabels[generation.status]}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{generation.phase}</span>
                  <span>{generation.progress}%</span>
                </div>
                <Progress value={generation.progress} />
              </div>
              {generation.retryCount ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  自动重试第 {generation.retryCount} 次
                </p>
              ) : null}
              {generation.errorMessage ? (
                <p className="mt-3 text-xs text-destructive">{generation.errorMessage}</p>
              ) : null}
            </div>

            {generation.outputImageUrl ? (
              <div className="overflow-hidden rounded-md border">
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
                className="w-full rounded-md border"
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
