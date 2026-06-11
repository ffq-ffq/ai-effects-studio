import { CreditsDisplay } from "@/components/user/credits-display";
import { RouteShell } from "@/components/shared/route-shell";

export default function BillingPage() {
  return (
    <RouteShell
      title="账单与额度"
      description="查看买断套餐、额度包和支付记录。"
    >
      <CreditsDisplay credits={1800} />
    </RouteShell>
  );
}
