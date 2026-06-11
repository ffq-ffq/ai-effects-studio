import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { templateAllocationRows, templateAllocationTotals } from "@/lib/constants";

export function TemplateAllocationTable() {
  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>行业</TableHead>
            <TableHead className="text-center">图片模板</TableHead>
            <TableHead className="text-center">视频模板</TableHead>
            <TableHead className="text-center">虚拟试穿</TableHead>
            <TableHead className="text-center">数字人口播</TableHead>
            <TableHead className="text-center">合计</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templateAllocationRows.map((row) => (
            <TableRow key={row.industry}>
              <TableCell className="font-medium">
                <span aria-hidden>{row.icon}</span>
                {row.icon ? " " : null}
                {row.industry}
              </TableCell>
              <TableCell className="text-center">{row.imageTemplates || "-"}</TableCell>
              <TableCell className="text-center">{row.videoTemplates || "-"}</TableCell>
              <TableCell className="text-center">
                {row.virtualTryOnTemplates
                  ? `${row.virtualTryOnTemplates}（${row.virtualTryOnNote}）`
                  : "-"}
              </TableCell>
              <TableCell className="text-center">
                {row.lipSyncTemplates || "-"}
              </TableCell>
              <TableCell className="text-center">{row.total}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold">
            <TableCell>合计</TableCell>
            <TableCell className="text-center">
              {templateAllocationTotals.imageTemplates}
            </TableCell>
            <TableCell className="text-center">
              {templateAllocationTotals.videoTemplates}
            </TableCell>
            <TableCell className="text-center">
              {templateAllocationTotals.virtualTryOnTemplates}
            </TableCell>
            <TableCell className="text-center">
              {templateAllocationTotals.lipSyncTemplates}
            </TableCell>
            <TableCell className="text-center">
              {templateAllocationTotals.total}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
