import { Progress } from "@/components/ui/progress";

export function UsageChart({ value = 42 }: { value?: number }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="mb-3 flex justify-between text-sm">
        <span>本月额度使用</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
