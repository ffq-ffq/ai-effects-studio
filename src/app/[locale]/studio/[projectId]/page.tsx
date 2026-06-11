import { CanvasEditorClient } from "@/components/editor/canvas-editor-client";
import { ExportPanel } from "@/components/editor/export-panel";
import { CopywritingGenerator } from "@/components/export/copywriting-generator";
import { MultiPlatformExport } from "@/components/export/multi-platform-export";
import { RouteShell } from "@/components/shared/route-shell";
import { BatchPanel } from "@/components/studio/batch-panel";
import { CompareSlider } from "@/components/studio/compare-slider";
import { FestivalTemplateShelf } from "@/components/templates/festival-template-shelf";
import { BrandAssetsManager } from "@/components/user/brand-assets-manager";

export default async function ProjectEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <RouteShell
      title={`项目编辑：${projectId}`}
      description="编辑生成结果，添加文案、水印，并导出多平台尺寸。"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <CanvasEditorClient />
        <ExportPanel projectId={projectId} />
      </div>
      <CompareSlider />
      <FestivalTemplateShelf />
      <BrandAssetsManager />
      <MultiPlatformExport />
      <BatchPanel />
      <CopywritingGenerator />
    </RouteShell>
  );
}
