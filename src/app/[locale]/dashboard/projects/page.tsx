import { DataTable } from "@/components/ui/data-table";
import { RouteShell } from "@/components/shared/route-shell";
import type { Project } from "@/types";

const projects: Project[] = [
  {
    id: "demo-1",
    title: "服装上新图",
    status: "completed",
    createdAt: "2026-06-09",
  },
];

const columns = [
  { accessorKey: "title", header: "项目" },
  { accessorKey: "status", header: "状态" },
  { accessorKey: "createdAt", header: "创建时间" },
];

export default function ProjectsPage() {
  return (
    <RouteShell
      title="项目"
      description="管理生成任务、编辑项目和历史素材。"
    >
      <DataTable columns={columns} data={projects} />
    </RouteShell>
  );
}
