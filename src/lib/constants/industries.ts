export const industries = [
  "服装",
  "餐饮",
  "房产",
  "培训",
  "零售",
  "自媒体",
  "外贸",
  "宠物",
  "美业",
  "婚庆",
  "数字人口播",
  "通用",
] as const;

export type Industry = (typeof industries)[number];
