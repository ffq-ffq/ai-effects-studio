import { CheckCircle2 } from "lucide-react";

const steps = ["上传素材", "选择模板", "生成图片和视频", "导出平台尺寸"] as const;

export function OnboardingGuide() {
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {steps.map((step) => (
        <li className="rounded-md border bg-card p-3 text-sm" key={step}>
          <CheckCircle2 className="mb-2 size-4 text-primary" />
          {step}
        </li>
      ))}
    </ol>
  );
}
