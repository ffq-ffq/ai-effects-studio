import { creditPackages, pricingPlans } from "@/lib/constants/pricing";

type CheckoutInput = {
  billingMode: CheckoutBillingMode;
  productKey: string;
  productType: CheckoutProductType;
};

export type CheckoutBillingMode = "buyout" | "subscription";
export type CheckoutProductType = "plan" | "credit_pack";

export type CheckoutProduct = {
  amountYuan: number;
  billingMode: CheckoutBillingMode;
  credits: number;
  description: string;
  key: string;
  name: string;
  planType?: "lite" | "standard" | "pro";
  productType: CheckoutProductType;
};

export function yuanToCents(amountYuan: number) {
  return Math.round(amountYuan * 100);
}

export function getCheckoutProduct(
  input: CheckoutInput,
): CheckoutProduct | null {
  if (input.productType === "plan") {
    const plan = pricingPlans.find((item) => item.id === input.productKey);

    if (!plan) {
      return null;
    }

    return {
      amountYuan:
        input.billingMode === "subscription"
          ? plan.subscriptionPrice
          : plan.buyoutPrice,
      billingMode: input.billingMode,
      credits: plan.credits,
      description: plan.description,
      key: plan.id,
      name: `${plan.name} ${input.billingMode === "subscription" ? "月订阅" : "买断"}`,
      planType: plan.id,
      productType: "plan",
    };
  }

  const creditPackage = creditPackages.find(
    (item) => item.id === input.productKey,
  );

  if (!creditPackage) {
    return null;
  }

  return {
    amountYuan: creditPackage.price,
    billingMode: "buyout",
    credits: creditPackage.credits,
    description: creditPackage.description,
    key: creditPackage.id,
    name: creditPackage.name,
    productType: "credit_pack",
  };
}
