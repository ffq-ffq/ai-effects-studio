"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCopy,
  Download,
  ExternalLink,
  Images,
  Link2,
  QrCode,
  Share2,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const XIAOHONGSHU_PUBLISH_URL =
  "https://creator.xiaohongshu.com/publish/publish?from=menu&target=article";
const DOUYIN_CREATOR_URL = "https://creator.douyin.com/";

type ShareActionsPanelProps = {
  projectId: string;
  disabled?: boolean;
};

type ShareAction = {
  title: string;
  description: string;
  icon: typeof Smartphone;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
};

export function ShareActionsPanel({
  projectId,
  disabled = false,
}: ShareActionsPanelProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const shareUrl = useMemo(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    return `${baseUrl.replace(/\/$/, "")}/zh-CN/share/${projectId}`;
  }, [projectId]);

  const shareCopy = useMemo(
    () =>
      [
        "AI 效果工坊生成结果",
        "已生成全平台尺寸图片、视频和营销文案。",
        `客户预览链接：${shareUrl}`,
      ].join("\n"),
    [shareUrl],
  );

  useEffect(() => {
    let mounted = true;

    async function renderQrCode() {
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(shareUrl, {
        margin: 1,
        width: 180,
      });

      if (mounted) {
        setQrCodeUrl(dataUrl);
      }
    }

    void renderQrCode();

    return () => {
      mounted = false;
    };
  }, [shareUrl]);

  async function copyShareText() {
    await navigator.clipboard.writeText(shareCopy);
    toast.success("已复制文案和预览链接");
  }

  async function createPreviewImageBlob() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.fillStyle = "#f7f4ea";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#1f3f3a";
    context.font = "600 72px sans-serif";
    context.fillText("AI 效果工坊", 96, 180);
    context.font = "400 42px sans-serif";
    context.fillText("全平台生成结果预览", 96, 270);
    context.fillStyle = "#2f8f7b";
    context.fillRect(96, 360, 888, 520);
    context.fillStyle = "#ffffff";
    context.font = "600 52px sans-serif";
    context.fillText("图片 + 视频 + 文案", 170, 625);

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  async function copySharePackage() {
    const imageBlob = await createPreviewImageBlob();

    if (imageBlob && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([shareCopy], { type: "text/plain" }),
          "image/png": imageBlob,
        }),
      ]);
      toast.success("已复制文案和图片");
      return;
    }

    await copyShareText();
  }

  async function copyShareLink() {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("分享链接已复制");
  }

  function mockDownload(message: string) {
    toast.success(message);
  }

  const actions: ShareAction[] = [
    {
      title: "保存全部到手机",
      description: "打开手机扫码页，一次保存全部生成结果。",
      icon: Smartphone,
      onClick: () => {
        void copyShareLink();
      },
      primary: true,
    },
    {
      title: "复制文案+图片",
      description: "复制营销文案和客户预览链接，粘贴到微信/朋友圈。",
      icon: ClipboardCopy,
      onClick: () => {
        void copySharePackage();
      },
    },
    {
      title: "跳转小红书发布",
      description: "打开小红书创作服务平台发布页。",
      icon: ExternalLink,
      href: XIAOHONGSHU_PUBLISH_URL,
    },
    {
      title: "跳转抖音发布",
      description: "打开抖音创作者中心，上传视频或图文。",
      icon: ExternalLink,
      href: DOUYIN_CREATOR_URL,
    },
    {
      title: "下载全部尺寸 ZIP",
      description: "打包下载 9 个平台规格的图片和视频。",
      icon: Download,
      onClick: () => mockDownload("已开始准备 ZIP 下载"),
    },
    {
      title: "生成分享链接",
      description: "发给客户预览成品、文案和平台尺寸。",
      icon: Link2,
      onClick: () => {
        void copyShareLink();
      },
    },
    {
      title: "扫码传到手机",
      description: "用手机扫码打开预览页并保存素材。",
      icon: QrCode,
      onClick: () => {
        void copyShareLink();
      },
    },
  ];

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="w-full justify-between" disabled={disabled} />
        }
      >
        <span className="inline-flex items-center gap-2">
          <Share2 className="size-4" />
          分享
        </span>
        <span className="text-xs opacity-80">生成完成后</span>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md" side="right">
        <SheetHeader className="pb-0">
          <SheetTitle>分享与发布</SheetTitle>
          <SheetDescription>
            生成完成后，把全尺寸素材、文案和客户预览链接分发到常用平台。
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 px-4 pb-4">
          <div className="rounded-md border bg-muted/35 p-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Images className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium">已生成全平台素材包</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  包含 9 个平台尺寸、营销文案和客户预览链接。
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              const className = cn(
                "group flex min-h-16 w-full items-center justify-between gap-3 rounded-md border p-3 text-left transition hover:border-primary hover:bg-primary/5",
                action.primary ? "border-primary/40 bg-primary/5" : "bg-card",
              );
              const content = (
                <>
                  <span className="flex min-w-0 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{action.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {action.description}
                      </span>
                    </span>
                  </span>
                  {action.href ? (
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                  ) : null}
                </>
              );

              if (action.href) {
                return (
                  <a
                    className={className}
                    href={action.href}
                    key={action.title}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  className={className}
                  key={action.title}
                  onClick={action.onClick}
                  type="button"
                >
                  {content}
                </button>
              );
            })}
          </div>

          <Separator />

          <div className="grid gap-3 rounded-md border bg-card p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">手机扫码预览</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  扫码打开客户预览页，保存图片和视频。
                </p>
              </div>
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="扫码传到手机"
                  className="size-24 rounded-md border bg-white p-1"
                  src={qrCodeUrl}
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-md border text-xs text-muted-foreground">
                  生成中
                </div>
              )}
            </div>
            <div className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              {shareUrl}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
