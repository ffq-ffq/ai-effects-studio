import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteShell } from "@/components/shared/route-shell";
import { allTemplates, getTemplateById, templateCategoryMap } from "@/lib/constants";

export function generateStaticParams() {
  return allTemplates.map((template) => ({ id: template.id }));
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  const category = templateCategoryMap[template.category];

  return (
    <RouteShell title={template.title} description={template.description}>
      <Card>
        <CardHeader>
          <CardTitle>
            {category.icon} {category.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <div className="grid gap-2 sm:grid-cols-4">
            <div>
              <p className="text-xs">行业</p>
              <p className="font-medium text-foreground">{template.industry}</p>
            </div>
            <div>
              <p className="text-xs">类型</p>
              <p className="font-medium text-foreground">{template.kind}</p>
            </div>
            <div>
              <p className="text-xs">额度</p>
              <p className="font-medium text-foreground">
                {template.creditCost} credits
              </p>
            </div>
            <div>
              <p className="text-xs">高级模板</p>
              <p className="font-medium text-foreground">
                {template.isPremium ? "是" : "否"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </RouteShell>
  );
}
