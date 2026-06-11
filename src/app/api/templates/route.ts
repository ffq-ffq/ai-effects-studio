import { allTemplates, getActiveFestivalTemplates } from "@/lib/constants";
import { templateQuerySchema, templateSchema } from "@/lib/validations/schemas";

export const runtime = "edge";

export function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = templateQuerySchema.safeParse({
    category: url.searchParams.get("category") ?? undefined,
    industry: url.searchParams.get("industry") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid template query" }, { status: 400 });
  }

  const { category, industry } = parsed.data;

  const sourceTemplates = [...getActiveFestivalTemplates(), ...allTemplates];
  const templates = sourceTemplates.filter((template) => {
    if (category && template.category !== category) return false;
    if (industry && template.industry !== industry) return false;
    return true;
  });

  return Response.json({
    ok: true,
    data: templates,
    meta: {
      total: templates.length,
      allTotal: sourceTemplates.length,
      festivalTotal: sourceTemplates.length - allTemplates.length,
    },
  });
}

export async function POST(request: Request) {
  const payload = templateSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return Response.json({ ok: false, error: "Invalid template payload" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      ...payload.data,
    },
  });
}
