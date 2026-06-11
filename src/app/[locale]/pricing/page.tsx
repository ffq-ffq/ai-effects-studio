import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteShell } from "@/components/shared/route-shell";
import { creditPackages, pricingNotes, pricingPlans } from "@/lib/constants";

export default function PricingPage() {
  return (
    <RouteShell
      title="买断制定价"
      description="一次购买永久使用，用完初始额度后按需购买额度包，无月费压力。"
    >
      <section className="grid gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">买断套餐</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              入场券 + 初始额度，永久使用；也可选择低价月订阅。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pricingNotes.map((note) => (
              <Badge key={note} variant="outline">
                {note}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              className={plan.recommended ? "border-primary shadow-sm" : undefined}
              key={plan.id}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge variant={plan.recommended ? "default" : "secondary"}>
                    {plan.recommended ? "⭐ 推荐" : plan.badge}
                  </Badge>
                </div>
                <div>
                  <p className="text-4xl font-semibold tracking-normal">
                    ¥{plan.buyoutPrice.toLocaleString("zh-CN")}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">买断</span>
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    或 ¥{plan.subscriptionPrice}/月订阅
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="font-semibold">{plan.credits}</p>
                    <p className="mt-1 text-xs text-muted-foreground">credits</p>
                  </div>
                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="font-semibold">{plan.templateCount}</p>
                    <p className="mt-1 text-xs text-muted-foreground">模板</p>
                  </div>
                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="font-semibold">{plan.industryCount}</p>
                    <p className="mt-1 text-xs text-muted-foreground">行业</p>
                  </div>
                </div>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li className="flex gap-2" key={feature}>
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-2">
                  <CheckoutButton
                    className="min-h-10 w-full"
                    productKey={plan.id}
                    productType="plan"
                  >
                    买断 {plan.name}
                  </CheckoutButton>
                  <CheckoutButton
                    billingMode="subscription"
                    className="min-h-10 w-full"
                    productKey={plan.id}
                    productType="plan"
                    variant="outline"
                  >
                    ¥{plan.subscriptionPrice}/月订阅
                  </CheckoutButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-semibold">额度包</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Credits 用完随时买，无月费；购买后继续生成图片、视频和文案。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {creditPackages.map((pack) => (
            <Card key={pack.id}>
              <CardHeader>
                <CardTitle className="text-base">{pack.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <p className="text-3xl font-semibold">¥{pack.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pack.credits.toLocaleString("zh-CN")} credits
                  </p>
                </div>
                <p className="min-h-12 text-sm leading-6 text-muted-foreground">
                  {pack.description}
                </p>
                <CheckoutButton
                  className="min-h-10"
                  productKey={pack.id}
                  productType="credit_pack"
                  variant="outline"
                >
                  购买额度包
                </CheckoutButton>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p>⚠️ Credits 有效期 18 个月</p>
        <p className="mt-2">🔄 用完购买额度包即可继续，无需重新购买套餐。</p>
      </section>
    </RouteShell>
  );
}
