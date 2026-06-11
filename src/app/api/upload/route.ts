import { uploadSchema } from "@/lib/validations/schemas";

export const runtime = "edge";

export async function POST(request: Request) {
  const payload = uploadSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return Response.json({ ok: false, error: "Invalid upload payload" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    data: {
      assetId: crypto.randomUUID(),
      ...payload.data,
    },
  });
}
