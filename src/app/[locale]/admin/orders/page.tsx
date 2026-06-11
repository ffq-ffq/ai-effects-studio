import { DataTable } from "@/components/ui/data-table";
import { RouteShell } from "@/components/shared/route-shell";

const orders = [
  { id: "ord_demo", plan: "开店包", amount: 199, status: "paid" },
];

const columns = [
  { accessorKey: "id", header: "订单" },
  { accessorKey: "plan", header: "套餐" },
  { accessorKey: "amount", header: "金额" },
  { accessorKey: "status", header: "状态" },
];

export default function AdminOrdersPage() {
  return (
    <RouteShell
      title="订单管理"
      description="查看买断套餐、额度包和退款记录。"
    >
      <DataTable columns={columns} data={orders} />
    </RouteShell>
  );
}
