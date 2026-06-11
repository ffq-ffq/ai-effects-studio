import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCheckoutProduct, yuanToCents } from "@/lib/stripe/products";
import { getStripeServerClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  productType: z.enum(["plan", "credit_pack"]),
  productKey: z.string().min(1),
  billingMode: z.enum(["buyout", "subscription"]).default("buyout"),
  locale: z.string().default("zh-CN"),
});

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function hasStripeConfig() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return Response.json(
      { ok: false, error: "Supabase 环境变量未配置" },
      { status: 503 },
    );
  }

  if (!hasStripeConfig()) {
    return Response.json(
      { ok: false, error: "Stripe 环境变量未配置" },
      { status: 503 },
    );
  }

  const payload = checkoutSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return Response.json({ ok: false, error: "Invalid checkout payload" }, { status: 400 });
  }

  const product = getCheckoutProduct(payload.data);

  if (!product) {
    return Response.json({ ok: false, error: "商品不存在" }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ ok: false, error: "请先登录" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const amountCents = yuanToCents(product.amountYuan);
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      product_type: product.productType,
      product_id: null,
      amount_cents: amountCents,
      currency: "cny",
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return Response.json(
      { ok: false, error: orderError?.message ?? "订单创建失败" },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = `${appUrl}/${payload.data.locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/${payload.data.locale}/pricing`;
  const mode = product.billingMode === "subscription" ? "subscription" : "payment";
  const metadata = {
    orderId: order.id,
    userId: user.id,
    productType: product.productType,
    productKey: product.key,
    billingMode: product.billingMode,
    planType: product.planType ?? "",
    credits: String(product.credits),
  };

  const stripe = getStripeServerClient();
  const session = await stripe.checkout.sessions.create({
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: order.id,
    customer: profile?.stripe_customer_id || undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cny",
          unit_amount: amountCents,
          product_data: {
            name: product.name,
            description: product.description,
          },
          ...(mode === "subscription"
            ? {
                recurring: {
                  interval: "month" as const,
                },
              }
            : {}),
        },
      },
    ],
    metadata,
    payment_intent_data:
      mode === "payment"
        ? {
            metadata,
          }
        : undefined,
    subscription_data:
      mode === "subscription"
        ? {
            metadata,
          }
        : undefined,
  });

  const { error: updateError } = await admin
    .from("orders")
    .update({ stripe_session_id: session.id })
    .eq("id", order.id);

  if (updateError) {
    return Response.json({ ok: false, error: updateError.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    data: {
      sessionId: session.id,
      url: session.url,
    },
  });
}
