import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { RouteShell } from "@/components/shared/route-shell";

export default function GalleryPage() {
  return (
    <RouteShell
      title="作品画廊"
      description="沉淀已生成素材，复用高转化作品样式。"
    >
      <GalleryGrid />
    </RouteShell>
  );
}
