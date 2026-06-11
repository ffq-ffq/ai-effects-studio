import { templateCategories } from "@/lib/constants";

export function TemplateCategoryList() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {templateCategories.map((category) => (
        <article className="rounded-md border bg-card p-4" key={category.id}>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              {category.icon}
            </span>
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                {category.id}
              </p>
              <h3 className="font-medium">{category.label}</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {category.description}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {category.examples.join("、")}
          </p>
        </article>
      ))}
    </div>
  );
}
