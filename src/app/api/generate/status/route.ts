import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generationStatusQuerySchema } from "@/lib/validations/schemas";

export const runtime = "nodejs";

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function GET(request: Request) {
  if (!hasSupabaseConfig()) {
    return Response.json(
      { ok: false, error: "Supabase 环境变量未配置" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const parsed = generationStatusQuerySchema.safeParse({
    generationId: url.searchParams.get("generationId") ?? url.searchParams.get("jobId"),
  });

  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid generationId" },
      { status: 400 },
    );
  }

  const { generationId } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ ok: false, error: "请先登录" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, status, progress, credits_cost, output_image_url, output_video_url, output_copywriting, platform_exports, error_message, retry_count, created_at, completed_at",
    )
    .eq("id", generationId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 404 });
  }

  return Response.json({
    ok: true,
    data,
  });
}
