import { featuredTemplates } from "@/lib/constants";

export function recommendTemplates(tags: string[]) {
  const normalizedTags = new Set(tags.map((tag) => tag.toLowerCase()));

  return featuredTemplates
    .map((template) => ({
      template,
      score: template.tags.reduce(
        (score, tag) => score + (normalizedTags.has(tag.toLowerCase()) ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ template }) => template);
}
