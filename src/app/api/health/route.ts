export const runtime = "edge";

export function GET() {
  return Response.json({
    ok: true,
    data: {
      service: "ai-effects-studio",
      runtime,
    },
  });
}
