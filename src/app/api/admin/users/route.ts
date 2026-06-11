export const runtime = "edge";

export function GET() {
  return Response.json({
    ok: true,
    data: [
      { id: "user-demo", email: "owner@example.com", credits: 600 },
    ],
  });
}
