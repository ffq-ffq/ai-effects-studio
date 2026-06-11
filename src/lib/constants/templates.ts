import type {
  GenerationMode,
  Template,
  TemplateCategory,
  TemplateKind,
} from "@/types";

export const templateCategories = [
  {
    id: "style_transfer",
    icon: "🎨",
    label: "风格迁移",
    description: "动漫、油画、赛博朋克等图像风格迁移。",
    examples: ["动漫", "油画", "赛博朋克"],
  },
  {
    id: "photo_style",
    icon: "📸",
    label: "摄影风格",
    description: "胶片、日系、电影感等真实摄影风格。",
    examples: ["胶片", "日系", "电影感"],
  },
  {
    id: "portrait",
    icon: "🧑",
    label: "人物美化",
    description: "AI 写真、证件照、卡通头像等人物模板。",
    examples: ["AI 写真", "证件照", "卡通头像"],
  },
  {
    id: "creative",
    icon: "🌟",
    label: "创意特效",
    description: "霓虹、火焰、光绘等高记忆点视觉特效。",
    examples: ["霓虹", "火焰", "光绘"],
  },
  {
    id: "utility",
    icon: "🔧",
    label: "实用工具",
    description: "抠图、超分、老照片修复等效率工具。",
    examples: ["抠图", "超分", "老照片修复"],
  },
  {
    id: "video",
    icon: "🎬",
    label: "视频生成",
    description: "产品展示、快闪、节日祝福等视频模板。",
    examples: ["产品展示", "快闪", "节日祝福"],
  },
  {
    id: "virtual_tryon",
    icon: "👗",
    label: "AI 模特上身",
    description: "上传衣服平铺或挂拍照片，生成模特穿着效果图。",
    examples: ["模特上身", "Outfit Anyone", "IDM-VTON"],
  },
  {
    id: "lip_sync",
    icon: "🎙️",
    label: "数字人口播",
    description: "上传口播视频，输入新文案，自动替换口型。",
    examples: ["Wav2Lip", "Edge TTS", "口型同步"],
  },
] as const satisfies ReadonlyArray<{
  id: TemplateCategory;
  icon: string;
  label: string;
  description: string;
  examples: readonly string[];
}>;

export const templateCategoryMap = Object.fromEntries(
  templateCategories.map((category) => [category.id, category]),
) as Record<TemplateCategory, (typeof templateCategories)[number]>;

export type TemplateAllocationRow = {
  industry: string;
  slug: string;
  icon: string;
  imageTemplates: number;
  videoTemplates: number;
  virtualTryOnTemplates: number;
  lipSyncTemplates: number;
  virtualTryOnNote?: string;
  total: number;
};

export const templateAllocationRows = [
  {
    industry: "服装",
    slug: "fashion",
    icon: "👗",
    imageTemplates: 10,
    videoTemplates: 5,
    virtualTryOnTemplates: 5,
    lipSyncTemplates: 0,
    virtualTryOnNote: "模特上身",
    total: 20,
  },
  {
    industry: "餐饮",
    slug: "food",
    icon: "🍜",
    imageTemplates: 10,
    videoTemplates: 3,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 13,
  },
  {
    industry: "房产",
    slug: "real-estate",
    icon: "🏠",
    imageTemplates: 8,
    videoTemplates: 3,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 11,
  },
  {
    industry: "培训",
    slug: "education",
    icon: "📚",
    imageTemplates: 8,
    videoTemplates: 2,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 10,
  },
  {
    industry: "零售",
    slug: "retail",
    icon: "🛍️",
    imageTemplates: 10,
    videoTemplates: 4,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 14,
  },
  {
    industry: "自媒体",
    slug: "media",
    icon: "📱",
    imageTemplates: 8,
    videoTemplates: 3,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 11,
  },
  {
    industry: "外贸",
    slug: "export",
    icon: "🌍",
    imageTemplates: 8,
    videoTemplates: 3,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 11,
  },
  {
    industry: "宠物",
    slug: "pet",
    icon: "🐾",
    imageTemplates: 5,
    videoTemplates: 2,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 7,
  },
  {
    industry: "美业",
    slug: "beauty",
    icon: "💄",
    imageTemplates: 5,
    videoTemplates: 2,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 7,
  },
  {
    industry: "婚庆",
    slug: "wedding",
    icon: "💍",
    imageTemplates: 8,
    videoTemplates: 3,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 11,
  },
  {
    industry: "数字人口播",
    slug: "talking-head",
    icon: "🎙️",
    imageTemplates: 0,
    videoTemplates: 0,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 5,
    total: 5,
  },
  {
    industry: "通用",
    slug: "utility",
    icon: "⚙️",
    imageTemplates: 5,
    videoTemplates: 0,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 5,
  },
] as const satisfies ReadonlyArray<TemplateAllocationRow>;

export const templateAllocationTotals = templateAllocationRows.reduce(
  (totals, row) => ({
    imageTemplates: totals.imageTemplates + row.imageTemplates,
    videoTemplates: totals.videoTemplates + row.videoTemplates,
    virtualTryOnTemplates:
      totals.virtualTryOnTemplates + row.virtualTryOnTemplates,
    lipSyncTemplates: totals.lipSyncTemplates + row.lipSyncTemplates,
    total: totals.total + row.total,
  }),
  {
    imageTemplates: 0,
    videoTemplates: 0,
    virtualTryOnTemplates: 0,
    lipSyncTemplates: 0,
    total: 0,
  },
);

export const virtualTryOnWorkflow = [
  "衣服分割提取",
  "衣服特征提取（颜色/纹理/版型/图案）",
  "人体姿态生成",
  "虚拟试穿渲染",
  "背景合成",
  "面部和手部修复（CodeFormer）",
  "超分放大",
] as const;

export const lipSyncWorkflow = [
  "用户上传视频（MP4/MOV/WebM，最长 30 秒，最大 50MB）",
  "输入新口播文案（中英文皆可，最多 300 字）",
  "选择声音风格（男声/女声/新闻腔/亲切/激昂）",
  "Edge TTS 把文字转成音频文件",
  "自动计算音频时长，超过原视频则提示缩短文案",
  "Wav2Lip 执行口型同步：原视频人脸 + 新音频 -> 嘴型匹配",
  "后处理：视频编码压缩 + 上传 Supabase Storage",
] as const;

export const virtualTryOnOptions = {
  models: ["亚洲女性", "亚洲男性", "欧美女性", "欧美男性"],
  bodySizes: ["S", "M", "L", "XL"],
  poses: ["站立正面", "侧身", "行走", "坐姿"],
  scenes: ["纯白棚拍", "街头", "咖啡厅", "海滩", "室内"],
  quantities: [1, 4, 9],
} as const;

export const lipSyncVoiceOptions = [
  { id: "male-news", label: "男声 · 新闻腔" },
  { id: "male-friendly", label: "男声 · 亲切" },
  { id: "male-energetic", label: "男声 · 激昂" },
  { id: "female-news", label: "女声 · 新闻腔" },
  { id: "female-friendly", label: "女声 · 亲切" },
  { id: "female-energetic", label: "女声 · 激昂" },
] as const;

const imageCategoryMix: Record<string, TemplateCategory[]> = {
  服装: ["photo_style", "style_transfer", "creative", "utility", "portrait"],
  餐饮: ["photo_style", "creative", "style_transfer", "utility"],
  房产: ["photo_style", "creative", "utility"],
  培训: ["portrait", "photo_style", "creative", "utility"],
  零售: ["photo_style", "creative", "utility", "style_transfer"],
  自媒体: ["portrait", "creative", "photo_style", "style_transfer"],
  外贸: ["photo_style", "utility", "creative"],
  宠物: ["portrait", "creative", "photo_style"],
  美业: ["portrait", "photo_style", "style_transfer", "creative"],
  婚庆: ["photo_style", "portrait", "creative", "style_transfer"],
  通用: ["utility", "photo_style", "creative"],
};

const imageTemplateNames: Record<TemplateCategory, string[]> = {
  style_transfer: ["动漫质感图", "油画海报", "赛博朋克图", "水彩插画", "国潮插画"],
  photo_style: ["胶片实拍", "日系清透图", "电影感主图", "高级棚拍", "自然光场景"],
  portrait: ["AI 写真", "证件照", "卡通头像", "形象照", "真人质感修饰"],
  creative: ["霓虹特效", "火焰视觉", "光绘海报", "节日氛围", "爆款封面"],
  utility: ["智能抠图", "4x 超分", "老照片修复", "背景替换", "电商白底图"],
  video: ["产品展示视频"],
  virtual_tryon: ["模特上身图"],
  lip_sync: ["口型替换"],
};

const videoTemplateNames = [
  "产品展示视频",
  "快闪促销视频",
  "节日祝福视频",
  "短视频封面动效",
  "门店探店视频",
] as const;

const virtualTryOnNames = [
  "模特上身正面图",
  "模特上身侧身图",
  "通勤穿搭图",
  "户外穿搭图",
  "直播间穿搭图",
] as const;

const lipSyncTemplates: Template[] = [
  {
    id: "talking-head-lip-sync-standard",
    title: "口型替换-标准",
    titleEn: "Standard lip replacement",
    industry: "数字人口播",
    mode: "lip-sync",
    category: "lip_sync",
    kind: "lip_sync",
    description: "上传口播视频并输入新文案，生成标准清晰度口型同步视频。",
    descriptionEn: "Standard Wav2Lip replacement with Edge TTS.",
    previewImage: "/templates/talking-head-rewrite.png",
    tags: ["数字人口播", "Wav2Lip", "Edge TTS"],
    creditCost: 8,
    estimatedSeconds: 40,
    outputNote: "约 40 秒",
    isPremium: true,
    sortOrder: 1,
  },
  {
    id: "talking-head-lip-sync-subtitle",
    title: "口型替换-加字幕",
    titleEn: "Lip replacement with subtitles",
    industry: "数字人口播",
    mode: "lip-sync",
    category: "lip_sync",
    kind: "lip_sync",
    description: "同步口型后自动叠加适合短视频平台的字幕。",
    descriptionEn: "Lip sync with platform-ready subtitles.",
    previewImage: "/templates/talking-head-rewrite.png",
    tags: ["数字人口播", "字幕", "短视频"],
    creditCost: 12,
    estimatedSeconds: 60,
    outputNote: "约 60 秒",
    isPremium: true,
    sortOrder: 2,
  },
  {
    id: "talking-head-lip-sync-bgm",
    title: "口型替换-加背景音乐",
    titleEn: "Lip replacement with BGM",
    industry: "数字人口播",
    mode: "lip-sync",
    category: "lip_sync",
    kind: "lip_sync",
    description: "生成新口播后自动混入轻量背景音乐，适合促销短片。",
    descriptionEn: "Lip sync with background music mixing.",
    previewImage: "/templates/talking-head-rewrite.png",
    tags: ["数字人口播", "背景音乐", "促销"],
    creditCost: 10,
    estimatedSeconds: 50,
    outputNote: "约 50 秒",
    isPremium: true,
    sortOrder: 3,
  },
  {
    id: "talking-head-lip-sync-beauty",
    title: "口型替换-美颜版",
    titleEn: "Lip replacement beauty pass",
    industry: "数字人口播",
    mode: "lip-sync",
    category: "lip_sync",
    kind: "lip_sync",
    description: "口型同步后叠加基础美颜与面部修复，适合真人出镜带货。",
    descriptionEn: "Lip sync with beauty and face restoration.",
    previewImage: "/templates/talking-head-rewrite.png",
    tags: ["数字人口播", "美颜", "真人出镜"],
    creditCost: 12,
    estimatedSeconds: 60,
    outputNote: "约 60 秒",
    isPremium: true,
    sortOrder: 4,
  },
  {
    id: "talking-head-lip-sync-preview",
    title: "口型替换-快速预览版",
    titleEn: "Fast lip sync preview",
    industry: "数字人口播",
    mode: "lip-sync",
    category: "lip_sync",
    kind: "lip_sync",
    description: "低分辨率快速预览，先看口型和节奏再正式生成。",
    descriptionEn: "Low-resolution preview for fast validation.",
    previewImage: "/templates/talking-head-rewrite.png",
    tags: ["数字人口播", "快速预览", "低分辨率"],
    creditCost: 3,
    estimatedSeconds: 20,
    outputNote: "约 20 秒，低分辨率",
    isPremium: false,
    sortOrder: 5,
  },
];

const previewByCategory: Record<TemplateCategory, string> = {
  style_transfer: "/templates/fashion-campaign-v2.png",
  photo_style: "/templates/restaurant-dish-set.png",
  portrait: "/templates/talking-head-rewrite.png",
  creative: "/templates/local-store-campaign-v2.png",
  utility: "/templates/local-store-promo.png",
  video: "/templates/restaurant-campaign-v2.png",
  virtual_tryon: "/templates/virtual-tryon.png",
  lip_sync: "/templates/talking-head-rewrite.png",
};

function toMode(category: TemplateCategory, kind: TemplateKind): GenerationMode {
  if (kind === "virtual_tryon") return "outfit";
  if (kind === "lip_sync") return "lip-sync";
  if (category === "video" || kind === "video") return "video";
  return "image";
}

function getCreditCost(category: TemplateCategory, kind: TemplateKind) {
  if (kind === "virtual_tryon") return 5;
  if (kind === "video") return 6;
  if (category === "utility") return 1;
  return 2;
}

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function createTemplate({
  row,
  index,
  category,
  kind,
  name,
}: {
  row: TemplateAllocationRow;
  index: number;
  category: TemplateCategory;
  kind: TemplateKind;
  name: string;
}): Template {
  const categoryInfo = templateCategoryMap[category];

  return {
    id: `${row.slug}-${kind.replace("_", "-")}-${padIndex(index)}`,
    title: `${row.industry}${name}`,
    titleEn: `${row.slug} ${kind} ${index + 1}`,
    industry: row.industry,
    mode: toMode(category, kind),
    category,
    kind,
    description:
      kind === "virtual_tryon"
        ? "上传衣服平铺或挂拍照片，选择模特、身材、姿势和场景后生成模特穿着效果图。"
        : `${row.industry}行业的${name}模板，适合一键生成产品图、视频和营销文案。`,
    descriptionEn: `${row.slug} template for ${category}.`,
    previewImage: previewByCategory[category],
    tags: [row.industry, categoryInfo.label, name],
    creditCost: getCreditCost(category, kind),
    isPremium: kind !== "image" || category === "creative",
    sortOrder: index + 1,
  };
}

function buildTemplatesForRow(row: TemplateAllocationRow): Template[] {
  const templates: Template[] = [];
  const mix = imageCategoryMix[row.industry] ?? ["photo_style"];

  for (let index = 0; index < row.imageTemplates; index += 1) {
    const category = mix[index % mix.length];
    const names = imageTemplateNames[category];
    templates.push(
      createTemplate({
        row,
        index,
        category,
        kind: "image",
        name: names[index % names.length],
      }),
    );
  }

  for (let index = 0; index < row.videoTemplates; index += 1) {
    templates.push(
      createTemplate({
        row,
        index,
        category: "video",
        kind: "video",
        name: videoTemplateNames[index % videoTemplateNames.length],
      }),
    );
  }

  for (let index = 0; index < row.virtualTryOnTemplates; index += 1) {
    templates.push(
      createTemplate({
        row,
        index,
        category: "virtual_tryon",
        kind: "virtual_tryon",
        name: virtualTryOnNames[index % virtualTryOnNames.length],
      }),
    );
  }

  if (row.lipSyncTemplates > 0) {
    templates.push(...lipSyncTemplates);
  }

  return templates;
}

export const allTemplates = templateAllocationRows.flatMap(buildTemplatesForRow);

export const featuredTemplates = [
  allTemplates.find((template) => template.id === "fashion-virtual-tryon-01"),
  allTemplates.find((template) => template.id === "food-image-01"),
  allTemplates.find((template) => template.id === "media-video-01"),
  allTemplates.find(
    (template) => template.id === "talking-head-lip-sync-standard",
  ),
].filter((template): template is Template => Boolean(template));

export function getTemplateById(id: string) {
  return allTemplates.find((template) => template.id === id);
}
