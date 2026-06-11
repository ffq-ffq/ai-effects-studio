import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareActionsPanel } from "@/components/export/share-actions-panel";

export function ExportPanel({
  projectId,
  isGenerationCompleted = true,
}: {
  projectId: string;
  isGenerationCompleted?: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-md border bg-card p-4">
      <div>
        <h3 className="font-medium">导出与分享</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          生成完成后下载素材包，或一键分发到常用平台。
        </p>
      </div>
      <Button variant="outline">
        <Download className="size-4" />
        导出文件
      </Button>
      <ShareActionsPanel
        disabled={!isGenerationCompleted}
        projectId={projectId}
      />
    </div>
  );
}
