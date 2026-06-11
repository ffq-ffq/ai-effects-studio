import { z } from "zod";

export const runtime = "edge";

const batchSchema = z.object({
  templateId: z.string().min(1),
  assetIds: z.array(z.string().min(1)).min(1).max(100),
});

export async function POST(request: Request) {
  const payload = batchSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return Response.json({ ok: false, error: "Invalid batch payload" }, { status: 400 });
  }

  return Response.json({
    ok: true,
    data: {
      batchId: crypto.randomUUID(),
      status: "queued",
      count: payload.data.assetIds.length,
    },
  });
}
