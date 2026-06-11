"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import type { CheckoutBillingMode, CheckoutProductType } from "@/lib/stripe/products";

type CheckoutButtonProps = {
  productType: CheckoutProductType;
  productKey: string;
  billingMode?: CheckoutBillingMode;
  children: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
};

export function CheckoutButton({
  productType,
  productKey,
  billingMode = "buyout",
  children,
  variant,
  className,
}: CheckoutButtonProps) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productType,
          productKey,
          billingMode,
          locale,
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        data?: { url?: string };
        error?: string;
      };

      if (!response.ok || !result.ok || !result.data?.url) {
        throw new Error(result.error ?? "支付会话创建失败");
      }

      window.location.href = result.data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "支付会话创建失败");
      setLoading(false);
    }
  }

  return (
    <Button
      className={className}
      disabled={loading}
      onClick={startCheckout}
      type="button"
      variant={variant}
    >
      {loading ? "跳转支付中..." : children}
    </Button>
  );
}
