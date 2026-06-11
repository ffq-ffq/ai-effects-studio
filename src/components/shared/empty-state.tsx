import type { ReactNode } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title = "暂无内容",
  description = "完成创建后会显示在这里。",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-[#171510]/15 bg-white/54 p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
        className,
      )}
    >
      <div className="relative mb-4 grid size-16 place-items-center rounded-full bg-[#f8ead0] text-[#9a641d]">
        <span className="absolute inset-2 rounded-full border border-[#d7bd7a]/50" />
        <ImagePlus className="size-7" />
      </div>
      <h3 className="text-base font-semibold text-[#171510]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#171510]/58">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
