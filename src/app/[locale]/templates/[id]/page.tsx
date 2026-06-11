import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteShell } from "@/components/shared/route-shell";
import { allTemplates, getTemplateById } from "@/lib/constants";
import type { Template, TemplateKind } from "@/types";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai-effects-studio.vercel.app";

const industryLabels: Record<string, string> = {
  fashion: "服装",
  food: "餐饮",
  "real-estate": "房产",
  education: "培训",
  retail: "零售",
  media: "自媒体",
  export: "外贸",
  pet: "宠物",
  beauty: "美业",
  wedding: "婚庆",
  "talking-head": "数字人口播",
  utility: "通用",
};

const categoryLabels: Record<Template["category"], string> = {
  style_transfer: "风格迁移",
  photo_style: "摄影风格",
  portrait: "人物美化",
  creative: "创意特效",
  utility: "实用工具",
  video: "视频生成",
  virtual_tryon: "AI 模特上身",
  lip_sync: "数字人口播",
};

const categoryIcons: Record<Template["category"], string> = {
  style_transfer: "🎨",
  photo_style: "📸",
  portrait: "🧑",
  creative: "🌟",
  utility: "🔧",
  video: "🎬",
  virtual_tryon: "👗",
  lip_sync: "🎙️",
};

function getTemplateSlug(template: Template) {
  return Object.keys(industryLabels)
    .sort((a, b) => b.length - a.length)
    .find((slug) => template.id.startsWith(`${slug}-`));
}

function getKindLabel(kind: TemplateKind) {
  if (kind === "virtual_tryon") return "AI 模特上身";
  if (kind === "lip_sync") return "数字人口播";
  if (kind === "video") return "视频生成";
  return "效果图";
}

function getTemplateNumber(template: Template) {
  return template.id.match(/-(\d+)$/)?.[1] ?? "01";
}

function getTemplateTitle(template: Template) {
  const lipSyncNames: Record<string, string> = {
    "talking-head-lip-sync-standard": "口型替换-标准",
    "talking-head-lip-sync-subtitle": "口型替换-加字幕",
    "talking-head-lip-sync-bgm": "口型替换-加背景音乐",
    "talking-head-lip-sync-beauty": "口型替换-美颜版",
    "talking-head-lip-sync-preview": "口型替换-快速预览版",
  };

  if (lipSyncNames[template.id]) {
    return lipSyncNames[template.id];
  }

  const slug = getTemplateSlug(template);
  const industry = slug ? industryLabels[slug] : "通用";

  return `${industry}${getKindLabel(template.kind)} ${getTemplateNumber(template)}`;
}

function getTemplateDescription(template: Template) {
  if (template.kind === "virtual_tryon") {
    return "上传衣服平铺或挂拍图，选择模特、身材、姿势和场景，生成真实上身效果图。";
  }

  if (template.kind === "lip_sync") {
    return "上传口播视频，输入新文案，AI 自动生成匹配新文字的口型视频。";
  }

  if (template.kind === "video") {
    return "一键生成产品展示、快闪促销或节日营销短视频。";
  }

  return "选择模板并上传素材，一键生成适合电商、社媒和私域传播的专业效果图。";
}

export function generateStaticParams() {
  return allTemplates.map((template) => ({ id: template.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const template = getTemplateById(id);

  if (!template) {
    return {};
  }

  const title = `${getTemplateTitle(template)} - AI 效果工坊`;
  const description = getTemplateDescription(template);
  const url = `${appUrl}/${locale}/templates/${template.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      images: [template.previewImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [template.previewImage],
    },
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  const title = getTemplateTitle(template);
  const description = getTemplateDescription(template);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    url: `${appUrl}/${locale}/templates/${template.id}`,
    image: `${appUrl}${template.previewImage}`,
    description,
    offers: {
      "@type": "Offer",
      price: template.creditCost,
      priceCurrency: "CREDITS",
    },
  };

  return (
    <RouteShell title={title} description={description}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {categoryIcons[template.category]} {categoryLabels[template.category]}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <div className="grid gap-2 sm:grid-cols-4">
            <div>
              <p className="text-xs">行业</p>
              <p className="font-medium text-foreground">
                {industryLabels[getTemplateSlug(template) ?? "utility"] ?? "通用"}
              </p>
            </div>
            <div>
              <p className="text-xs">类型</p>
              <p className="font-medium text-foreground">
                {getKindLabel(template.kind)}
              </p>
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
            {[
              industryLabels[getTemplateSlug(template) ?? "utility"],
              categoryLabels[template.category],
              getKindLabel(template.kind),
            ]
              .filter(Boolean)
              .slice(0, 8)
              .map((tag) => (
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
