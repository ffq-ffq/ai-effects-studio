"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { virtualTryOnOptions } from "@/lib/constants";

function FieldSelect({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        className="min-h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function VirtualTryOnPanel() {
  const [model, setModel] = useState<string>(virtualTryOnOptions.models[0]);
  const [bodySize, setBodySize] = useState<string>(
    virtualTryOnOptions.bodySizes[1],
  );
  const [pose, setPose] = useState<string>(virtualTryOnOptions.poses[0]);
  const [scene, setScene] = useState<string>(virtualTryOnOptions.scenes[0]);
  const [quantity, setQuantity] = useState("1");

  const totalCredits = Number(quantity) * 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>👗 AI 虚拟试穿</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldSelect
            id="tryon-model"
            label="模特"
            onChange={setModel}
            options={virtualTryOnOptions.models}
            value={model}
          />
          <FieldSelect
            id="tryon-body"
            label="身材"
            onChange={setBodySize}
            options={virtualTryOnOptions.bodySizes}
            value={bodySize}
          />
          <FieldSelect
            id="tryon-pose"
            label="姿势"
            onChange={setPose}
            options={virtualTryOnOptions.poses}
            value={pose}
          />
          <FieldSelect
            id="tryon-scene"
            label="场景"
            onChange={setScene}
            options={virtualTryOnOptions.scenes}
            value={scene}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tryon-quantity">数量</Label>
          <select
            className="min-h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="tryon-quantity"
            onChange={(event) => setQuantity(event.target.value)}
            value={quantity}
          >
            {virtualTryOnOptions.quantities.map((option) => (
              <option key={option} value={String(option)}>
                {option} 张
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          当前配置：{model} · {bodySize} · {pose} · {scene} · {quantity} 张
        </div>
        <Button>
          <WandSparkles className="size-4" />
          生成试穿图 · {totalCredits} credits
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          底层模型：Outfit Anyone + IDM-VTON。定价：5 credits/张。
        </p>
      </CardContent>
    </Card>
  );
}
