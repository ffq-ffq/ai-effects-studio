import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OneClickShare() {
  return (
    <div className="rounded-md border bg-card p-4">
      <h3 className="font-medium">一键分享</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        生成分享链接，发送给客户或团队预览。
      </p>
      <Button className="mt-4" variant="outline">
        <Send className="size-4" />
        创建分享链接
      </Button>
    </div>
  );
}
