import type { Template } from "@/types";

export type FestivalCampaign = {
  id: string;
  name: string;
  date: Date;
  launchDate: Date;
  daysUntil: number;
  theme: string;
  industries: string[];
  copyHint: string;
};

type FestivalDefinition = {
  id: string;
  name: string;
  theme: string;
  industries: string[];
  copyHint: string;
  fixedDate?: { month: number; day: number };
  dynamicDate?: (year: number) => Date;
  datesByYear?: Record<number, string>;
};

const launchWindowDays = 14;
const dayMs = 24 * 60 * 60 * 1000;

const festivalDefinitions: FestivalDefinition[] = [
  {
    id: "spring-festival",
    name: "春节",
    theme: "新春开门红",
    industries: ["服装", "餐饮", "零售", "美业", "婚庆"],
    copyHint: "年货节、团圆、焕新、开门红",
    datesByYear: {
      2026: "2026-02-17",
      2027: "2027-02-06",
    },
  },
  {
    id: "valentines-day",
    name: "情人节",
    theme: "浪漫告白",
    industries: ["美业", "婚庆", "餐饮", "零售"],
    copyHint: "告白、约会、礼物、双人套餐",
    fixedDate: { month: 2, day: 14 },
  },
  {
    id: "womens-day",
    name: "三八",
    theme: "女神节宠爱",
    industries: ["美业", "服装", "零售", "培训"],
    copyHint: "宠爱自己、悦己消费、女神节专属",
    fixedDate: { month: 3, day: 8 },
  },
  {
    id: "labor-day",
    name: "五一",
    theme: "假期出游",
    industries: ["餐饮", "房产", "宠物", "零售"],
    copyHint: "小长假、出游、门店促销、到店福利",
    fixedDate: { month: 5, day: 1 },
  },
  {
    id: "mothers-day",
    name: "母亲节",
    theme: "妈妈的礼物",
    industries: ["美业", "餐饮", "零售", "培训"],
    copyHint: "感恩妈妈、亲情礼物、家庭聚餐",
    dynamicDate: (year) => getNthWeekdayOfMonth(year, 5, 0, 2),
  },
  {
    id: "520",
    name: "520",
    theme: "爱意上新",
    industries: ["美业", "婚庆", "餐饮", "服装"],
    copyHint: "520告白、情侣穿搭、浪漫礼盒",
    fixedDate: { month: 5, day: 20 },
  },
  {
    id: "618",
    name: "618",
    theme: "年中大促",
    industries: ["服装", "零售", "外贸", "自媒体"],
    copyHint: "限时折扣、爆款返场、年中囤货",
    fixedDate: { month: 6, day: 18 },
  },
  {
    id: "dragon-boat",
    name: "端午",
    theme: "端午安康",
    industries: ["餐饮", "零售", "宠物", "自媒体"],
    copyHint: "粽子礼盒、安康祝福、传统节日",
    datesByYear: {
      2026: "2026-06-19",
      2027: "2027-06-09",
    },
  },
  {
    id: "qixi",
    name: "七夕",
    theme: "东方浪漫",
    industries: ["婚庆", "美业", "餐饮", "服装"],
    copyHint: "七夕约会、礼物、东方浪漫、限定套餐",
    datesByYear: {
      2026: "2026-08-19",
    },
  },
  {
    id: "mid-autumn",
    name: "中秋",
    theme: "团圆礼遇",
    industries: ["餐饮", "零售", "外贸", "房产"],
    copyHint: "月饼礼盒、团圆、送礼、家庭场景",
    datesByYear: {
      2026: "2026-09-25",
      2027: "2027-09-15",
    },
  },
  {
    id: "national-day",
    name: "国庆",
    theme: "黄金周热卖",
    industries: ["餐饮", "房产", "零售", "宠物"],
    copyHint: "黄金周、出游、到店、家国氛围",
    fixedDate: { month: 10, day: 1 },
  },
  {
    id: "double-11",
    name: "双11",
    theme: "年度大促",
    industries: ["服装", "零售", "美业", "外贸"],
    copyHint: "年度低价、限时秒杀、爆款清单",
    fixedDate: { month: 11, day: 11 },
  },
  {
    id: "double-12",
    name: "双12",
    theme: "年末返场",
    industries: ["服装", "零售", "餐饮", "自媒体"],
    copyHint: "返场、清仓、年末福利、复购",
    fixedDate: { month: 12, day: 12 },
  },
  {
    id: "christmas",
    name: "圣诞",
    theme: "节日礼物季",
    industries: ["外贸", "宠物", "美业", "餐饮"],
    copyHint: "圣诞礼物、海外买家、派对、暖冬",
    fixedDate: { month: 12, day: 25 },
  },
];

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number) {
  const firstDay = new Date(year, month - 1, 1);
  const offset = (weekday - firstDay.getDay() + 7) % 7;
  return new Date(year, month - 1, 1 + offset + (nth - 1) * 7);
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getFestivalDate(definition: FestivalDefinition, year: number) {
  if (definition.datesByYear?.[year]) {
    return parseDate(definition.datesByYear[year]);
  }

  if (definition.dynamicDate) {
    return definition.dynamicDate(year);
  }

  if (definition.fixedDate) {
    return new Date(year, definition.fixedDate.month - 1, definition.fixedDate.day);
  }

  return null;
}

export function getFestivalCampaigns(now = new Date()) {
  const today = startOfLocalDay(now);
  const years = [today.getFullYear(), today.getFullYear() + 1];

  return years
    .flatMap((year) =>
      festivalDefinitions.flatMap((definition) => {
        const date = getFestivalDate(definition, year);

        if (!date) {
          return [];
        }

        const festivalDate = startOfLocalDay(date);
        const launchDate = addDays(festivalDate, -launchWindowDays);
        const daysUntil = Math.round((festivalDate.getTime() - today.getTime()) / dayMs);

        return [
          {
            id: `${definition.id}-${year}`,
            name: definition.name,
            date: festivalDate,
            launchDate,
            daysUntil,
            theme: definition.theme,
            industries: definition.industries,
            copyHint: definition.copyHint,
          },
        ];
      }),
    )
    .sort((left, right) => left.date.getTime() - right.date.getTime());
}

export function getActiveFestivalCampaigns(now = new Date()) {
  return getFestivalCampaigns(now).filter(
    (campaign) => campaign.daysUntil >= 0 && campaign.daysUntil <= launchWindowDays,
  );
}

export function getActiveFestivalTemplates(now = new Date()): Template[] {
  return getActiveFestivalCampaigns(now).flatMap((campaign) => [
    {
      id: `festival-${campaign.id}-poster`,
      title: `${campaign.name}营销海报`,
      titleEn: `${campaign.name} Campaign Poster`,
      industry: "通用",
      mode: "image",
      category: "creative",
      kind: "image",
      description: `${campaign.theme}主题，一键生成节日主图、朋友圈封面和小红书封面。`,
      descriptionEn: `${campaign.theme} seasonal poster set.`,
      previewImage: "/templates/local-store-promo.png",
      tags: ["节日营销", campaign.name, "自动上架", ...campaign.industries.slice(0, 2)],
      creditCost: 2,
      isPremium: true,
      sortOrder: -campaign.daysUntil,
      outputNote: campaign.copyHint,
    },
    {
      id: `festival-${campaign.id}-video`,
      title: `${campaign.name}促销短视频`,
      titleEn: `${campaign.name} Promo Video`,
      industry: "通用",
      mode: "video",
      category: "video",
      kind: "video",
      description: `${campaign.theme}快闪视频模板，自动匹配倒计时、促销口播和平台封面。`,
      descriptionEn: `${campaign.theme} seasonal promo video.`,
      previewImage: "/templates/talking-head-rewrite.png",
      tags: ["节日营销", campaign.name, "短视频", "提前上架"],
      creditCost: 6,
      isPremium: true,
      sortOrder: -campaign.daysUntil,
      estimatedSeconds: 45,
      outputNote: campaign.copyHint,
    },
  ]);
}

export function formatFestivalDate(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
