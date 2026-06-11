"use client";

import { allTemplates, templateCategories, templateCategoryMap } from "@/lib/constants";
import type { Template, TemplateCategory } from "@/types";
import { cn } from "@/lib/utils";
import { TemplateCard } from "./template-card";

type TemplateSelectorProps = {
  activeCategory: TemplateCategory;
  onCategoryChange: (category: TemplateCategory) => void;
  selectedTemplateId?: string;
  onTemplateSelect?: (template: Template) => void;
};

export function TemplateSelector({
  activeCategory,
  onCategoryChange,
  selectedTemplateId,
  onTemplateSelect,
}: TemplateSelectorProps) {
  const templates = allTemplates.filter(
    (template) => template.category === activeCategory,
  );
  const category = templateCategoryMap[activeCategory];

  return (
    <section className="grid gap-4">
      <div
        aria-label="模板分类"
        className="flex gap-2 overflow-x-auto rounded-md border bg-card p-2"
        role="tablist"
      >
        {templateCategories.map((item) => (
          <button
            aria-selected={activeCategory === item.id}
            className={cn(
              "min-h-11 min-w-fit rounded-md px-3 py-2 text-sm font-medium transition",
              activeCategory === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            key={item.id}
            onClick={() => onCategoryChange(item.id)}
            role="tab"
            type="button"
          >
            <span aria-hidden>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-md border bg-card p-4">
        <p className="text-xs font-mono text-muted-foreground">{activeCategory}</p>
        <h2 className="mt-1 text-xl font-semibold">
          {category.icon} {category.label}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {category.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <button
            className={cn(
              "rounded-md text-left ring-offset-background transition hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selectedTemplateId === template.id ? "ring-2 ring-primary" : "",
            )}
            key={template.id}
            onClick={() => onTemplateSelect?.(template)}
            type="button"
          >
            <TemplateCard template={template} />
          </button>
        ))}
      </div>
    </section>
  );
}
