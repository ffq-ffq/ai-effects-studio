"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ClipboardCopy,
  Hash,
  MessageCircle,
  Mic2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { industries } from "@/lib/constants";
import {
  createMarketingCopyPack,
  type MarketingCopyPack,
} from "@/lib/generation/copywriting";

function CopyButton({ text }: { text: string }) {
  return (
    <Button
      onClick={() => {
        void navigator.clipboard.writeText(text);
        toast.success("已复制文案");
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      <ClipboardCopy className="size-4" />
      复制
    </Button>
  );
}

function CopyCard({
  title,
  icon: Icon,
  children,
  text,
}: {
  title: string;
  icon: typeof Sparkles;
  children: ReactNode;
  text: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
        <CopyButton text={text} />
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

function formatCopyPack(pack: MarketingCopyPack) {
  return {
    xiaohongshu: `${pack.xiaohongshu.title}\n\n${pack.xiaohongshu.body}\n\n${pack.xiaohongshu.hashtags.join(" ")}`,
    douyin: [
      `抖音口播脚本（${pack.douyinScript.duration}）`,
      `开头：${pack.douyinScript.hook}`,
      ...pack.douyinScript.shots.map(
        (shot) => `${shot.time}｜${shot.visual}\n口播：${shot.voiceover}`,
      ),
    ].join("\n\n"),
    taobao: `${pack.taobaoDetail.title}\n\n${pack.taobaoDetail.sections.join("\n")}`,
    moments: [
      `走心版：${pack.moments.heartfelt}`,
      `促销版：${pack.moments.promotion}`,
      `专业版：${pack.moments.professional}`,
    ].join("\n\n"),
    hashtags: pack.hashtags.join(" "),
  };
}

export function CopywritingGenerator() {
  const [industry, setIndustry] = useState<string>("服装");
  const [productName, setProductName] = useState("通勤显瘦衬衫");
  const [sellingPoint, setSellingPoint] =
    useState("面料挺括不容易皱，版型显瘦，日常通勤和约会都能穿。");

  const copyPack = useMemo(
    () =>
      createMarketingCopyPack({
        industry,
        productName,
        sellingPoint,
      }),
    [industry, productName, sellingPoint],
  );
  const formatted = useMemo(() => formatCopyPack(copyPack), [copyPack]);

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI 营销文案
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="grid gap-2">
              <Label htmlFor="copy-industry">行业</Label>
              <select
                className="min-h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="copy-industry"
                onChange={(event) => setIndustry(event.target.value)}
                value={industry}
              >
                {industries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="copy-product">产品名</Label>
              <Input
                id="copy-product"
                onChange={(event) => setProductName(event.target.value)}
                placeholder="输入产品名"
                value={productName}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="copy-selling-point">核心卖点</Label>
            <Textarea
              id="copy-selling-point"
              onChange={(event) => setSellingPoint(event.target.value)}
              placeholder="输入材质、价格、场景、服务或活动信息"
              value={sellingPoint}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <CopyCard
          icon={Sparkles}
          text={formatted.xiaohongshu}
          title="小红书文案"
        >
          <div className="space-y-3">
            <p className="font-medium text-foreground">{copyPack.xiaohongshu.title}</p>
            <p className="whitespace-pre-line">{copyPack.xiaohongshu.body}</p>
            <p className="text-primary">{copyPack.xiaohongshu.hashtags.join(" ")}</p>
          </div>
        </CopyCard>

        <CopyCard
          icon={Mic2}
          text={formatted.douyin}
          title="抖音口播脚本"
        >
          <div className="space-y-3">
            <p className="font-medium text-foreground">
              {copyPack.douyinScript.duration}｜{copyPack.douyinScript.hook}
            </p>
            <ol className="grid gap-2">
              {copyPack.douyinScript.shots.map((shot) => (
                <li className="rounded-md bg-muted/45 p-3" key={shot.time}>
                  <p className="font-medium text-foreground">{shot.time}</p>
                  <p>分镜：{shot.visual}</p>
                  <p>口播：{shot.voiceover}</p>
                </li>
              ))}
            </ol>
          </div>
        </CopyCard>

        <CopyCard
          icon={ShoppingBag}
          text={formatted.taobao}
          title="淘宝详情文案"
        >
          <div className="space-y-3">
            <p className="font-medium text-foreground">{copyPack.taobaoDetail.title}</p>
            <ul className="grid gap-2">
              {copyPack.taobaoDetail.sections.map((section) => (
                <li className="rounded-md bg-muted/45 p-3" key={section}>
                  {section}
                </li>
              ))}
            </ul>
          </div>
        </CopyCard>

        <CopyCard
          icon={MessageCircle}
          text={formatted.moments}
          title="朋友圈文案 3 套"
        >
          <div className="grid gap-3">
            <div>
              <p className="font-medium text-foreground">走心版</p>
              <p>{copyPack.moments.heartfelt}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">促销版</p>
              <p>{copyPack.moments.promotion}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">专业版</p>
              <p>{copyPack.moments.professional}</p>
            </div>
          </div>
        </CopyCard>
      </div>

      <CopyCard icon={Hash} text={formatted.hashtags} title="配套 hashtag">
        <div className="flex flex-wrap gap-2">
          {copyPack.hashtags.map((tag) => (
            <span className="rounded-md bg-secondary px-2 py-1 text-xs" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </CopyCard>
    </section>
  );
}
