import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteShell } from "@/components/shared/route-shell";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const [{ locale }, { session_id: sessionId }] = await Promise.all([
    params,
    searchParams,
  ]);

  return (
    <RouteShell
      title="支付成功"
      description="Stripe 已确认支付。额度和套餐会在 webhook 完成后自动写入账户。"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            订单已提交处理
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>
            支付完成后，系统会通过 Stripe webhook 更新订单状态、套餐和 credits
            交易记录。
          </p>
          {sessionId ? (
            <p className="rounded-md border bg-muted/40 p-3 font-mono text-xs">
              Session ID：{sessionId}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="min-h-10"
              render={<Link href={`/${locale}/dashboard/billing`} />}
            >
              查看账单与额度
            </Button>
            <Button
              className="min-h-10"
              render={<Link href={`/${locale}/studio`} />}
              variant="outline"
            >
              返回创作台
            </Button>
          </div>
        </CardContent>
      </Card>
    </RouteShell>
  );
}
