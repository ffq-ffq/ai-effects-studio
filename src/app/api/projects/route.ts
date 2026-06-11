import { projectQuerySchema, projectSchema } from "@/lib/validations/schemas";

export const runtime = "edge";

export function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = projectQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid project query" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    data: [
      {
        id: "demo-project",
        title: "服装上新图",
        status: "completed",
      },
    ],
  });
}

export async function POST(request: Request) {
  const payload = projectSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return Response.json({ ok: false, error: "Invalid project payload" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    data: {
      id: crypto.randomUUID(),
      ...payload.data,
    },
  });
}
