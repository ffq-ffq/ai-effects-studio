import { TemplateGrid } from "@/components/templates/template-grid";
import { RouteShell } from "@/components/shared/route-shell";

export default function AdminTemplatesPage() {
  return (
    <RouteShell
      title="模板管理"
      description="管理行业模板、预览图、额度消耗和推荐标签。"
    >
      <TemplateGrid />
    </RouteShell>
  );
}
