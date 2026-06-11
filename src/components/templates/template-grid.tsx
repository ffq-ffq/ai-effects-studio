import { allTemplates, getActiveFestivalTemplates } from "@/lib/constants";
import { TemplateCard } from "@/components/studio/template-card";

export function TemplateGrid({ limit }: { limit?: number }) {
  const templatesWithFestivals = [...getActiveFestivalTemplates(), ...allTemplates];
  const templates =
    typeof limit === "number" ? templatesWithFestivals.slice(0, limit) : templatesWithFestivals;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
