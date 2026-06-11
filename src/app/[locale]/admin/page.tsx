import { UsageChart } from "@/components/user/usage-chart";
import { RouteShell } from "@/components/shared/route-shell";

export default function AdminPage() {
  return (
    <RouteShell
      title="管理后台"
      description="查看平台运行状态、订单和模板配置。"
    >
      <UsageChart value={68} />
    </RouteShell>
  );
}
