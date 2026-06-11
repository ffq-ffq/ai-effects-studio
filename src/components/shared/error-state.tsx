import type { ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  message?: string;
  title?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "操作失败",
  message = "加载失败，请稍后重试。",
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-900",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-red-100">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 leading-6 text-red-800/78">{message}</p>
        </div>
      </div>
      {onRetry || action ? (
        <div className="flex flex-wrap gap-2 pl-12">
          {onRetry ? (
            <Button onClick={onRetry} size="sm" type="button" variant="outline">
              <RefreshCcw className="size-4" />
              重试
            </Button>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
