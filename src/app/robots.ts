import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai-effects-studio.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/zh-CN/admin/", "/en-US/admin/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
