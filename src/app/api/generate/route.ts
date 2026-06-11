import { runGenerationPipeline } from "@/lib/generation/pipeline";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return runGenerationPipeline(request);
}
