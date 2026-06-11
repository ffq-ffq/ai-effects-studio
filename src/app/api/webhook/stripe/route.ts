import type Stripe from "stripe";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeServerClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

function hasWebhookConfig() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}

export async function POST(request: Request) {
  if (!hasWebhookConfig()) {
    return Response.json(
      { ok: false, error: "Stripe 或 Supabase webhook 环境变量未配置" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ ok: false, error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripeServerClient();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid webhook signature",
      },
      { status: 400 },
    );
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata ?? {};
  const orderId = metadata.orderId;
  const userId = metadata.userId;
  const credits = Number(metadata.credits ?? 0);
  const planType = metadata.planType || null;

  if (!orderId || !userId || !Number.isFinite(credits) || credits <= 0) {
    return Response.json({ ok: false, error: "Checkout metadata 不完整" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const description =
    metadata.productType === "plan"
      ? `${metadata.productKey} ${metadata.billingMode} 套餐购买`
      : `${metadata.productKey} 额度包购买`;

  const { error } = await admin.rpc("apply_paid_checkout_order", {
    p_order_id: orderId,
    p_user_id: userId,
    p_stripe_session_id: session.id,
    p_stripe_customer_id: getCustomerId(session.customer),
    p_plan_type: planType,
    p_credits: credits,
    p_description: description,
  });

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    received: true,
    event: event.type,
    orderId,
  });
}
