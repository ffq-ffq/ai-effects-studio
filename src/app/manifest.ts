import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI 效果工坊",
    short_name: "效果工坊",
    description: "小生意人的 AI 视觉内容工厂",
    start_url: "/zh-CN/studio",
    scope: "/",
    display: "standalone",
    background_color: "#f8f4ea",
    theme_color: "#d7bd7a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    categories: ["productivity", "photo", "business"],
    lang: "zh-CN",
  };
}
