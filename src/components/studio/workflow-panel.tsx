import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkflowPanel({
  title,
  steps,
}: {
  title: string;
  steps: readonly string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2">
          {steps.map((step, index) => (
            <li className="flex gap-2 text-sm" key={step}>
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                {index + 1}. {step}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
