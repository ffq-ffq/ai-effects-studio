import dynamic from "next/dynamic";
import { FullPageLoadingSkeleton } from "@/components/shared/loading-skeleton";

const StudioWorkbench = dynamic(
  () =>
    import("@/components/studio/studio-workbench").then(
      (mod) => mod.StudioWorkbench,
    ),
  {
    loading: () => <FullPageLoadingSkeleton />,
  },
);

export default function StudioPage() {
  return (
    <main className="relative flex w-full flex-1 flex-col px-2 py-3 sm:px-3 lg:px-4">
      <section className="flex w-full flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-[#171510]/10 bg-white/54 px-4 py-3 shadow-[0_14px_40px_rgba(23,21,16,0.07)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-[#81662b]">
              AI Effects Studio
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#171510] sm:text-3xl">
              创作台
            </h1>
            <p className="mt-1 text-sm leading-6 text-[#171510]/58">
              上传素材、选择模板，生成图片、视频和营销文案。
            </p>
          </div>
          <div className="hidden rounded-full border border-[#171510]/10 bg-[#f8f4ea] px-4 py-2 text-sm font-medium text-[#81662b] md:block">
            三栏工作台 · 模板 / 创作 / 历史
          </div>
        </div>
        <StudioWorkbench />
      </section>
    </main>
  );
}
