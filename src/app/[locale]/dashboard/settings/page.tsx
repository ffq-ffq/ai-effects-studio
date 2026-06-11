import { RouteShell } from "@/components/shared/route-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <RouteShell
      title="账号设置"
      description="管理品牌信息、默认水印和导出偏好。"
    >
      <div className="grid max-w-xl gap-3">
        <Label htmlFor="brand">品牌名称</Label>
        <Input id="brand" placeholder="输入你的店铺或品牌名称" />
      </div>
    </RouteShell>
  );
}
