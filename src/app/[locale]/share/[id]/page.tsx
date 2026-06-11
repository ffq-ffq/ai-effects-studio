import { CopywritingGenerator } from "@/components/export/copywriting-generator";
import { OneClickShare } from "@/components/export/one-click-share";
import { RouteShell } from "@/components/shared/route-shell";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RouteShell
      title={`分享作品：${id}`}
      description="公开预览成品图片、视频和营销文案。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <CopywritingGenerator />
        <OneClickShare />
      </div>
    </RouteShell>
  );
}
