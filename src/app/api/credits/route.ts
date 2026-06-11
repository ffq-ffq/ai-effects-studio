import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function GET() {
  if (!hasSupabaseConfig()) {
    return Response.json(
      { ok: false, error: "Supabase 环境变量未配置" },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ ok: false, error: "请先登录" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("credits_remaining, total_credits_purchased, total_generations")
    .eq("id", user.id)
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  return Response.json({
    ok: true,
    data: {
      credits: data.credits_remaining,
      reserved: 0,
      totalCreditsPurchased: data.total_credits_purchased,
      totalGenerations: data.total_generations,
    },
  });
}
