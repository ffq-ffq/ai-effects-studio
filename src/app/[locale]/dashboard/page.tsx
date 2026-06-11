import { CreditsDisplay } from "@/components/user/credits-display";
import { UsageChart } from "@/components/user/usage-chart";
import { RouteShell } from "@/components/shared/route-shell";

export default function DashboardPage() {
  return (
    <RouteShell
      title="仪表盘"
      description="查看近期项目、额度消耗和生成任务状态。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <CreditsDisplay />
        <UsageChart />
      </div>
    </RouteShell>
  );
}
