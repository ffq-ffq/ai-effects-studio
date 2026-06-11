import type { CreditPackage } from "@/types";

export const pricingPlans = [
  {
    id: "lite",
    name: "Lite",
    buyoutPrice: 283,
    subscriptionPrice: 9,
    credits: 200,
    templateCount: "50+模板",
    industryCount: "5个行业",
    badge: "入门",
    recommended: false,
    description: "适合刚开始做商品图、朋友圈素材和轻量营销内容的小店。",
    features: ["永久使用，无月费", "200 credits 初始额度", "50+ 模板", "覆盖 5 个行业", "无水印导出"],
  },
  {
    id: "standard",
    name: "Standard",
    buyoutPrice: 645,
    subscriptionPrice: 29,
    credits: 600,
    templateCount: "100+模板",
    industryCount: "8个行业",
    badge: "推荐",
    recommended: true,
    description: "适合稳定上新、短视频种草和多平台投放的小生意团队。",
    features: [
      "永久使用，无月费",
      "600 credits 初始额度",
      "100+ 模板",
      "覆盖 8 个行业",
      "无水印导出",
      "视频生成",
      "AI 模特上身",
      "AI 营销文案",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    buyoutPrice: 1443,
    subscriptionPrice: 69,
    credits: 2000,
    templateCount: "125模板",
    industryCount: "全部10行业",
    badge: "全功能",
    recommended: false,
    description: "适合批量生产、品牌素材管理、数字人口播和商业化交付。",
    features: [
      "永久使用，无月费",
      "2000 credits 初始额度",
      "125 模板",
      "全部 10 个行业",
      "批处理",
      "品牌资产",
      "API",
      "数字人口播",
      "商业授权",
    ],
  },
] as const;

export const creditPackages: CreditPackage[] = [
  {
    id: "credits-100",
    name: "100 credits",
    credits: 100,
    price: 7,
    description: "临时补充少量图片、文案和预览任务。",
  },
  {
    id: "credits-300",
    name: "300 credits",
    credits: 300,
    price: 17,
    description: "适合一轮新品上架或小批量营销素材。",
  },
  {
    id: "credits-1000",
    name: "1000 credits",
    credits: 1000,
    price: 45,
    description: "适合稳定周更、短视频和多平台导出。",
  },
  {
    id: "credits-5000",
    name: "5000 credits",
    credits: 5000,
    price: 149,
    description: "适合批量生成、团队共用和长期投放。",
  },
];

export const pricingNotes = [
  "Credits 有效期 18 个月",
  "用完购买额度包即可继续",
  "买断套餐是入场券 + 初始额度，永久使用，无月费",
] as const;
