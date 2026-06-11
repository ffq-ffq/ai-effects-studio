import { RouteShell } from "@/components/shared/route-shell";
import { FestivalTemplateShelf } from "@/components/templates/festival-template-shelf";
import { IndustryFilter } from "@/components/templates/industry-filter";
import { TemplateAllocationTable } from "@/components/templates/template-allocation-table";
import { TemplateCategoryList } from "@/components/templates/template-category-list";
import { TemplateGrid } from "@/components/templates/template-grid";
import { templateAllocationTotals } from "@/lib/constants";

export default function TemplatesPage() {
  return (
    <RouteShell
      title={`模板体系（${templateAllocationTotals.total} 个）`}
      description="按照行业、生成类型和核心 AI 能力拆分模板，让用户不用写 Prompt 也能稳定产出。"
    >
      <FestivalTemplateShelf />

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">模板分类</h2>
        <TemplateCategoryList />
      </section>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold">模板数量分配</h2>
        <TemplateAllocationTable />
      </section>

      <section className="grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">模板列表</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              当前已生成 {templateAllocationTotals.total} 个模板数据项。
            </p>
          </div>
          <IndustryFilter />
        </div>
        <TemplateGrid />
      </section>
    </RouteShell>
  );
}
