import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { templateCategoryMap } from "@/lib/constants";
import type { Template } from "@/types";

export function TemplateCard({ template }: { template: Template }) {
  const category = templateCategoryMap[template.category];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{template.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {template.description}
        </p>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {category.icon} {category.label}
          </span>
          <span>{template.creditCost} credits</span>
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
  );
}
