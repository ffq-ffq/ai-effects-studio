import { DataTable } from "@/components/ui/data-table";
import { RouteShell } from "@/components/shared/route-shell";

const users = [
  { email: "owner@example.com", role: "owner", credits: 600 },
  { email: "operator@example.com", role: "member", credits: 120 },
];

const columns = [
  { accessorKey: "email", header: "用户" },
  { accessorKey: "role", header: "角色" },
  { accessorKey: "credits", header: "额度" },
];

export default function AdminUsersPage() {
  return (
    <RouteShell title="用户管理" description="查看用户、额度和角色。">
      <DataTable columns={columns} data={users} />
    </RouteShell>
  );
}
