import {
  BadgeCheck,
  Clapperboard,
  Images,
  Megaphone,
  Shirt,
  Sparkles,
} from "lucide-react";
import { industries } from "./industries";
import { creditPackages, pricingNotes, pricingPlans } from "./pricing";
import {
  formatFestivalDate,
  getActiveFestivalCampaigns,
  getActiveFestivalTemplates,
  getFestivalCampaigns,
} from "./festival-marketing";
import { exportPlatformSizes } from "@/lib/utils/platform-sizes";
import {
  allTemplates,
  featuredTemplates,
  getTemplateById,
  lipSyncVoiceOptions,
  lipSyncWorkflow,
  templateAllocationRows,
  templateAllocationTotals,
  templateCategories,
  templateCategoryMap,
  virtualTryOnOptions,
  virtualTryOnWorkflow,
} from "./templates";

export {
  allTemplates,
  creditPackages,
  featuredTemplates,
  formatFestivalDate,
  getActiveFestivalCampaigns,
  getActiveFestivalTemplates,
  getFestivalCampaigns,
  getTemplateById,
  industries,
  lipSyncVoiceOptions,
  lipSyncWorkflow,
  pricingPlans,
  pricingNotes,
  templateAllocationRows,
  templateAllocationTotals,
  templateCategories,
  templateCategoryMap,
  virtualTryOnOptions,
  virtualTryOnWorkflow,
};

export const platformSizes = exportPlatformSizes.map(
  (size) => `${size.label} ${size.width}×${size.height ?? "不限"}`,
);

export const studioStats = [
  { label: "行业模板", value: "125" },
  { label: "单品出图", value: "6" },
  { label: "同步视频", value: "2" },
  { label: "平台尺寸", value: "9" },
] as const;

export const workflowSteps = [
  {
    title: "上传素材",
    description: "商品图、真人口播、门店照片或短视频。",
    icon: Images,
  },
  {
    title: "选择模板",
    description: "按行业、平台和目标自动收敛模板。",
    icon: Sparkles,
  },
  {
    title: "生成套装",
    description: "图片、视频、营销文案一次产出。",
    icon: Clapperboard,
  },
] as const;

export const flagshipEffects = [
  {
    title: "AI 模特上身",
    description: "服装平铺图生成真人穿搭效果。",
    icon: Shirt,
  },
  {
    title: "数字人口播",
    description: "用新文案替换原视频口型和配音。",
    icon: Megaphone,
  },
  {
    title: "产品保真",
    description: "ControlNet 锁定轮廓、颜色和构图。",
    icon: BadgeCheck,
  },
] as const;
