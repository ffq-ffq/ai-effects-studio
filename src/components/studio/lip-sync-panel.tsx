"use client";

import { useMemo, useState } from "react";
import { Mic2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lipSyncVoiceOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Template } from "@/types";

type LipSyncPanelProps = {
  selectedTemplate?: Template;
};

export function LipSyncPanel({ selectedTemplate }: LipSyncPanelProps) {
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState<string>(lipSyncVoiceOptions[0].id);
  const overLimit = script.length > 300;
  const selectedCost = selectedTemplate?.creditCost ?? 8;
  const selectedDuration = selectedTemplate?.outputNote ?? "约40秒";

  const helperText = useMemo(() => {
    if (overLimit) return "文案已超过 300 字，请缩短后再生成。";
    return `${script.length}/300 字 · 当前模板 ${selectedCost} credits · ${selectedDuration}`;
  }, [overLimit, script.length, selectedCost, selectedDuration]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎙️ 数字人口播</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="lip-sync-script">新口播文案</Label>
          <Textarea
            className="min-h-36 text-base"
            id="lip-sync-script"
            maxLength={360}
            onChange={(event) => setScript(event.target.value)}
            placeholder="输入新的口播文案，AI 帮你对上口型"
            value={script}
          />
          <p
            className={cn(
              "text-xs text-muted-foreground",
              overLimit ? "text-destructive" : "",
            )}
          >
            {helperText}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="voice-style">声音风格</Label>
          <select
            className="min-h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="voice-style"
            onChange={(event) => setVoice(event.target.value)}
            value={voice}
          >
            {lipSyncVoiceOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-md border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
          Edge TTS 会先生成音频；如果音频时长超过原视频，系统会提示缩短文案。
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button disabled={overLimit || !script.trim()} variant="outline">
            <Zap className="size-4" />
            快速预览 · 3 credits
          </Button>
          <Button disabled={overLimit || !script.trim()}>
            <Mic2 className="size-4" />
            正式生成 · {selectedCost} credits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
