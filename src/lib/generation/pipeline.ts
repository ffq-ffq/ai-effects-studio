import type { SupabaseClient } from "@supabase/supabase-js";
import { allTemplates, getTemplateById } from "@/lib/constants";
import { applyServerWatermark } from "@/lib/ai/watermark";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateSchema } from "@/lib/validations/schemas";
import type { GenerationStatus, Template } from "@/types";
import { createMarketingCopy } from "./copywriting";
import { reserveGenerationCredits, refundGenerationCredits } from "./credits";
import { createPlatformExports } from "./platform-exports";
import { broadcastGenerationProgress } from "./realtime";
import { mirrorRemoteAssetToStorage } from "./storage";
import { executeTemplateWorkflow, type WorkflowResult } from "./workflow";

const MAX_RETRIES = 2;
const STORAGE_BUCKET = "generations";

type Profile = {
  id: string;
  plan_type: "free" | "lite" | "standard" | "pro" | "admin";
  credits_remaining: number;
};

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function canUseTemplate(profile: Profile, template: Template) {
  if (!template.isPremium) return true;
  return profile.plan_type !== "free";
}

function getTemplateCost(template: Template, payload: unknown) {
  if (
    template.kind === "virtual_tryon" &&
    payload &&
    typeof payload === "object" &&
    "quantity" in payload &&
    typeof payload.quantity === "number"
  ) {
    return template.creditCost * payload.quantity;
  }

  return template.creditCost;
}

function getNullableUuid(value?: string) {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : null;
}

async function updateGeneration(
  supabase: SupabaseClient,
  generationId: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("generations")
    .update(values)
    .eq("id", generationId);

  if (error) {
    throw new Error(error.message);
  }

  if (typeof values.status === "string" && typeof values.progress === "number") {
    await broadcastGenerationProgress(supabase, {
      id: generationId,
      status: values.status as GenerationStatus,
      progress: values.progress,
      retryCount:
        typeof values.retry_count === "number" ? values.retry_count : undefined,
      errorMessage:
        typeof values.error_message === "string" || values.error_message === null
          ? values.error_message
          : undefined,
      outputImageUrl:
        typeof values.output_image_url === "string" || values.output_image_url === null
          ? values.output_image_url
          : undefined,
      outputVideoUrl:
        typeof values.output_video_url === "string" || values.output_video_url === null
          ? values.output_video_url
          : undefined,
    });
  }
}

async function createGenerationRecord({
  supabase,
  userId,
  template,
  cost,
  payload,
}: {
  supabase: SupabaseClient;
  userId: string;
  template: Template;
  cost: number;
  payload: ReturnType<typeof generateSchema.parse>;
}) {
  const record: Record<string, unknown> = {
    project_id: payload.projectId ?? null,
    user_id: userId,
    template_id: getNullableUuid(template.id),
    template_slug: template.id,
    input_image_url: payload.inputImageUrl ?? null,
    input_video_url: payload.inputVideoUrl ?? null,
    input_text: payload.inputText ?? null,
    status: "queued",
    progress: 0,
    credits_cost: cost,
    prompt: payload.prompt ?? null,
    platform_exports: createPlatformExports(payload.platformTargets),
    retry_count: 0,
  };

  if (payload.generationId) {
    record.id = payload.generationId;
  }

  const { data, error } = await supabase
    .from("generations")
    .insert(record)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}

async function runPostProcessing({
  supabase,
  generationId,
  workflowResult,
  template,
  profile,
  payload,
  prompt,
  inputText,
}: {
  supabase: SupabaseClient;
  generationId: string;
  workflowResult: WorkflowResult;
  template: Template;
  profile: Profile;
  payload: ReturnType<typeof generateSchema.parse>;
  prompt?: string;
  inputText?: string;
}) {
  const brandLogoUrl = await resolveBrandLogoUrl({
    supabase,
    userId: profile.id,
    profile,
    payload,
  });
  const imageUpload = await mirrorRemoteAssetToStorage({
    supabase,
    bucket: STORAGE_BUCKET,
    sourceUrl: workflowResult.outputImageUrl,
    path: `${generationId}/output.png`,
    contentType: "image/png",
    transform: workflowResult.outputImageUrl
      ? async (input) => ({
          buffer: await applyServerWatermark(input, {
            planType: profile.plan_type,
            brandLogoUrl,
          }),
          contentType: "image/png",
        })
      : undefined,
  });

  if (!imageUpload.ok) {
    throw new Error(imageUpload.error);
  }

  const videoUpload = await mirrorRemoteAssetToStorage({
    supabase,
    bucket: STORAGE_BUCKET,
    sourceUrl: workflowResult.outputVideoUrl,
    path: `${generationId}/output.mp4`,
    contentType: "video/mp4",
  });

  if (!videoUpload.ok) {
    throw new Error(videoUpload.error);
  }

  return {
    outputImageUrl: imageUpload.publicUrl ?? workflowResult.outputImageUrl,
    outputVideoUrl: videoUpload.publicUrl ?? workflowResult.outputVideoUrl,
    copywriting: createMarketingCopy({ template, prompt, inputText }),
  };
}

async function resolveBrandLogoUrl({
  supabase,
  userId,
  profile,
  payload,
}: {
  supabase: SupabaseClient;
  userId: string;
  profile: Profile;
  payload: ReturnType<typeof generateSchema.parse>;
}) {
  if (!payload.applyBrandLogo) {
    return null;
  }

  if (profile.plan_type !== "pro" && profile.plan_type !== "admin") {
    return null;
  }

  if (payload.brandLogoUrl) {
    return payload.brandLogoUrl;
  }

  if (!payload.brandAssetId) {
    return null;
  }

  const { data } = await supabase
    .from("brand_assets")
    .select("logo_url")
    .eq("id", payload.brandAssetId)
    .eq("user_id", userId)
    .single();

  return typeof data?.logo_url === "string" ? data.logo_url : null;
}

export async function runGenerationPipeline(request: Request) {
  if (!hasSupabaseConfig()) {
    return Response.json(
      { ok: false, error: "Supabase 环境变量未配置" },
      { status: 503 },
    );
  }

  const parsed = generateSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "Invalid generation payload" },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const template = getTemplateById(payload.templateId);

  if (!template) {
    return Response.json({ ok: false, error: "模板不存在" }, { status: 404 });
  }

  if (template.mode !== payload.mode) {
    return Response.json(
      { ok: false, error: "模板类型与生成模式不匹配" },
      { status: 400 },
    );
  }

  if (template.kind === "lip_sync" && !payload.inputText?.trim()) {
    return Response.json(
      { ok: false, error: "数字人口播需要输入新口播文案" },
      { status: 400 },
    );
  }

  const serverSupabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await serverSupabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ ok: false, error: "请先登录" }, { status: 401 });
  }

  const adminSupabase = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, plan_type, credits_remaining")
    .eq("id", user.id)
    .single<Profile>();

  if (profileError || !profile) {
    return Response.json(
      { ok: false, error: "用户资料不存在" },
      { status: 403 },
    );
  }

  if (!canUseTemplate(profile, template)) {
    return Response.json(
      { ok: false, error: "当前套餐无权使用该模板" },
      { status: 403 },
    );
  }

  const cost = getTemplateCost(template, payload);
  const reserved = await reserveGenerationCredits({
    supabase: adminSupabase,
    userId: user.id,
    amount: cost,
    description: `生成扣减：${template.title}`,
  });

  if (!reserved.ok) {
    return Response.json({ ok: false, error: reserved.error }, { status: 402 });
  }

  let generationId: string | undefined;

  try {
    generationId = await createGenerationRecord({
      supabase: adminSupabase,
      userId: user.id,
      template,
      cost,
      payload,
    });
    await broadcastGenerationProgress(adminSupabase, {
      id: generationId,
      status: "queued",
      progress: 0,
      message: "排队中",
      retryCount: 0,
    });
  } catch (error) {
    await refundGenerationCredits({
      supabase: adminSupabase,
      userId: user.id,
      amount: cost,
      description: `创建生成记录失败退款：${template.title}`,
    });

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "创建生成记录失败",
      },
      { status: 500 },
    );
  }

  let lastError = "";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await updateGeneration(adminSupabase, generationId, {
        status: "generating",
        progress: attempt === 0 ? 10 : 15,
        retry_count: attempt,
      });

      const workflowResult = await executeTemplateWorkflow({
        generationId,
        template,
        payload,
      });

      if (!workflowResult.ok) {
        throw new Error(workflowResult.error);
      }

      await updateGeneration(adminSupabase, generationId, {
        status: "generating",
        progress: 85,
        retry_count: attempt,
      });

      await updateGeneration(adminSupabase, generationId, {
        status: "post_processing",
        progress: 90,
      });

      const processed = await runPostProcessing({
        supabase: adminSupabase,
        generationId,
        workflowResult: workflowResult.data,
        template,
        profile,
        payload,
        prompt: payload.prompt,
        inputText: payload.inputText,
      });

      await updateGeneration(adminSupabase, generationId, {
        status: "post_processing",
        progress: 95,
      });

      await updateGeneration(adminSupabase, generationId, {
        status: "completed",
        progress: 100,
        output_image_url: processed.outputImageUrl ?? null,
        output_video_url: processed.outputVideoUrl ?? null,
        output_copywriting: processed.copywriting,
        platform_exports: createPlatformExports(payload.platformTargets).map(
          (item) => ({ ...item, status: "completed" }),
        ),
        completed_at: new Date().toISOString(),
        error_message: null,
      });

      return Response.json({
        ok: true,
        data: {
          generationId,
          status: "completed",
          creditsCost: cost,
          template,
          outputImageUrl: processed.outputImageUrl,
          outputVideoUrl: processed.outputVideoUrl,
          copywriting: processed.copywriting,
        },
      });
    } catch (error) {
      lastError = error instanceof Error ? error.message : "生成失败";

      await updateGeneration(adminSupabase, generationId, {
        status: attempt === MAX_RETRIES ? "failed" : "queued",
        progress: attempt === MAX_RETRIES ? 100 : 0,
        retry_count: attempt + 1,
        error_message: lastError,
      });
    }
  }

  await refundGenerationCredits({
    supabase: adminSupabase,
    userId: user.id,
    amount: cost,
    generationId,
    description: `生成失败退款：${template.title}`,
  });

  return Response.json(
    {
      ok: false,
      error: lastError,
      data: {
        generationId,
        status: "failed",
        refundedCredits: cost,
      },
    },
    { status: 502 },
  );
}

export function getSupportedWorkflowCount() {
  return allTemplates.length;
}
