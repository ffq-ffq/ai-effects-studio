import { Inbox } from "lucide-react";

export function EmptyState({
  title = "暂无内容",
  description = "创建后会显示在这里。",
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <Inbox className="mb-3 size-8 text-muted-foreground" />
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
