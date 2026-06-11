import type { SupabaseClient } from "@supabase/supabase-js";

type ReserveCreditsArgs = {
  supabase: SupabaseClient;
  userId: string;
  amount: number;
  description: string;
};

type RefundCreditsArgs = ReserveCreditsArgs & {
  generationId?: string;
};

export async function reserveGenerationCredits({
  supabase,
  userId,
  amount,
  description,
}: ReserveCreditsArgs) {
  const { data, error } = await supabase.rpc("reserve_generation_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message === "INSUFFICIENT_CREDITS"
          ? "额度不足"
          : error.message,
    } as const;
  }

  return { ok: true, data } as const;
}

export async function refundGenerationCredits({
  supabase,
  userId,
  amount,
  description,
  generationId,
}: RefundCreditsArgs) {
  const { error } = await supabase.rpc("refund_generation_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_generation_id: generationId ?? null,
    p_description: description,
  });

  if (error) {
    return { ok: false, error: error.message } as const;
  }

  return { ok: true } as const;
}
