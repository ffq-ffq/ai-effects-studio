import type { PlatformSize } from "@/types";

export const exportPlatformSizes: PlatformSize[] = [
  {
    id: "taobao-main",
    label: "淘宝主图",
    width: 800,
    height: 800,
    ratio: "1:1",
  },
  {
    id: "pdd-main",
    label: "拼多多主图",
    width: 750,
    height: 750,
    ratio: "1:1",
  },
  {
    id: "rednote-portrait",
    label: "小红书竖版",
    width: 1080,
    height: 1440,
    ratio: "3:4",
  },
  {
    id: "rednote-landscape",
    label: "小红书横版",
    width: 1440,
    height: 1080,
    ratio: "4:3",
  },
  {
    id: "douyin-cover",
    label: "抖音封面",
    width: 1080,
    height: 1920,
    ratio: "9:16",
  },
  {
    id: "moments",
    label: "朋友圈",
    width: 1080,
    height: 1080,
    ratio: "1:1",
  },
  {
    id: "wechat-header",
    label: "公众号头图",
    width: 900,
    height: 383,
    ratio: "2.35:1",
  },
  {
    id: "bilibili-cover",
    label: "B站封面",
    width: 1920,
    height: 1080,
    ratio: "16:9",
  },
  {
    id: "detail-long",
    label: "详情页长图",
    width: 750,
    height: null,
    ratio: "自由高度",
  },
];

export function formatPlatformSize(size: PlatformSize) {
  return `${size.width} × ${size.height ?? "不限"} · ${size.ratio}`;
}
