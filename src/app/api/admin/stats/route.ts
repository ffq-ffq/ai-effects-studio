export const runtime = "edge";

export function GET() {
  return Response.json({
    ok: true,
    data: {
      users: 1,
      projects: 1,
      generatedAssets: 8,
      revenue: 199,
    },
  });
}
