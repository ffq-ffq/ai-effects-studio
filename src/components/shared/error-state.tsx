import { AlertTriangle } from "lucide-react";

export function ErrorState({ message = "加载失败，请稍后重试。" }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <AlertTriangle className="size-4" />
      {message}
    </div>
  );
}
