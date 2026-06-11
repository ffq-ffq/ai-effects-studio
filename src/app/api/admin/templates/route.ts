import { allTemplates } from "@/lib/constants";

export const runtime = "edge";

export function GET() {
  return Response.json({
    ok: true,
    data: allTemplates,
    meta: {
      total: allTemplates.length,
    },
  });
}
