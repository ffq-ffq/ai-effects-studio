import type { MetadataRoute } from "next";
import { allTemplates } from "@/lib/constants";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai-effects-studio.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/zh-CN",
    "/zh-CN/studio",
    "/zh-CN/templates",
    "/zh-CN/pricing",
    "/zh-CN/gallery",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${appUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/zh-CN" ? 1 : 0.8,
    })),
    ...allTemplates.map((template) => ({
      url: `${appUrl}/zh-CN/templates/${template.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
