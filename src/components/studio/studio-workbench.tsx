"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Clapperboard,
  ImageIcon,
  Loader2,
  Megaphone,
  Mic2,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Shirt,
  Sparkles,
  Store,
  UploadCloud,
  UserRound,
  WandSparkles,
  WalletCards,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FullPageLoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGenerate } from "@/hooks/use-generate";
import {
  useGenerationRealtime,
  type GenerationRealtimePayload,
} from "@/hooks/use-generation-realtime";
import { allTemplates } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Template, TemplateKind } from "@/types";

const ONBOARDING_KEY = "ai-effects-studio:studio-onboarding-v1";

const industryOptions = [
  { slug: "fashion", label: "服装", icon: Shirt },
  { slug: "food", label: "餐饮", icon: Store },
  { slug: "real-estate", label: "房产", icon: Store },
  { slug: "education", label: "培训", icon: UserRound },
  { slug: "retail", label: "零售", icon: Store },
  { slug: "media", label: "自媒体", icon: Megaphone },
  { slug: "export", label: "外贸", icon: Sparkles },
  { slug: "pet", label: "宠物", icon: Sparkles },
  { slug: "beauty", label: "美业", icon: WandSparkles },
  { slug: "wedding", label: "婚庆", icon: Sparkles },
  { slug: "talking-head", label: "数字人口播", icon: Mic2 },
] as const;

const industryBySlug = Object.fromEntries(
  industryOptions.map((item) => [item.slug, item.label]),
) as Record<(typeof industryOptions)[number]["slug"], string>;

const typeFilters: Array<{
  label: string;
  value: "all" | TemplateKind;
  icon: typeof ImageIcon;
}> = [
  { label: "全部", value: "all", icon: Sparkles },
  { label: "图片", value: "image", icon: ImageIcon },
  { label: "视频", value: "video", icon: Clapperboard },
  { label: "模特上身", value: "virtual_tryon", icon: Shirt },
  { label: "数字人口播", value: "lip_sync", icon: Mic2 },
];

const voiceOptions = [
  "女声 / 亲切带货",
  "女声 / 新闻腔",
  "男声 / 专业讲解",
  "男声 / 激昂促销",
  "中性声 / 清晰预览",
] as const;

const onboardingSteps = [
  {
    title: "第一步：选择行业和模板",
    description: "左侧按行业、图片/视频/模特上身/数字人口播筛选模板。",
  },
  {
    title: "第二步：上传素材",
    description: "把产品图、衣服平铺图或口播视频拖进上传区，系统会自动预览。",
  },
  {
    title: "第三步：补充生成要求",
    description: "Prompt 可以不写，也可以补充卖点、活动、场景和口播文案。",
  },
  {
    title: "第四步：生成并导出",
    description: "生成后可查看进度、下载多平台尺寸、复制文案或分享给客户。",
  },
] as const;

type UploadedAsset = {
  file: File;
  url: string;
  type: "image" | "video";
};

type HistoryItem = {
  id: string;
  title: string;
  status: string;
  thumbnail: string;
  time: string;
};

function waitForRealtimeSubscription() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 120);
  });
}

function getTemplateSlug(template: Template) {
  return industryOptions
    .map((item) => item.slug)
    .sort((a, b) => b.length - a.length)
    .find((slug) => template.id.startsWith(`${slug}-`));
}

function getTemplateNumber(template: Template) {
  return template.id.match(/-(\d+)$/)?.[1] ?? "01";
}

function getKindLabel(kind: TemplateKind) {
  if (kind === "virtual_tryon") return "AI 模特上身";
  if (kind === "lip_sync") return "数字人口播";
  if (kind === "video") return "视频生成";
  return "效果图";
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
  const industry = slug
    ? industryBySlug[slug as keyof typeof industryBySlug]
    : "通用";

  return `${industry}${getKindLabel(template.kind)} ${getTemplateNumber(template)}`;
}

function getTemplateDescription(template: Template) {
  if (template.kind === "virtual_tryon") {
    return "上传衣服平铺或挂拍图，选择模特、身材、姿势和场景，生成真实上身效果。";
  }

  if (template.kind === "lip_sync") {
    return "上传口播视频，输入新文案，AI 自动生成匹配新文字的口型视频。";
  }

  if (template.kind === "video") {
    return "自动生成产品展示、快闪促销或节日营销短视频。";
  }

  return "一键生成适合电商、社媒和私域传播的专业效果图。";
}

function isCreditsError(error?: string) {
  if (!error) return false;
  const normalized = error.toLowerCase();
  return (
    normalized.includes("credit") ||
    normalized.includes("额度") ||
    normalized.includes("402")
  );
}

export function StudioWorkbench() {
  const [isBooting, setIsBooting] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [industrySlug, setIndustrySlug] = useState<
    (typeof industryOptions)[number]["slug"]
  >("fashion");
  const [typeFilter, setTypeFilter] = useState<"all" | TemplateKind>(
    "virtual_tryon",
  );
  const [query, setQuery] = useState("");
  const [asset, setAsset] = useState<UploadedAsset | null>(null);
  const [prompt, setPrompt] = useState("");
  const [lipSyncText, setLipSyncText] = useState("");
  const [voice, setVoice] = useState<(typeof voiceOptions)[number]>(
    voiceOptions[0],
  );
  const [generation, setGeneration] = useState<GenerationRealtimePayload>();
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "hist-1",
      title: "春季服装上新",
      status: "已完成",
      thumbnail: "/templates/fashion-campaign-v2.png",
      time: "刚刚",
    },
    {
      id: "hist-2",
      title: "餐饮套餐海报",
      status: "已完成",
      thumbnail: "/templates/restaurant-campaign-v2.png",
      time: "12 分钟前",
    },
    {
      id: "hist-3",
      title: "门店促销主图",
      status: "已完成",
      thumbnail: "/templates/local-store-campaign-v2.png",
      time: "今天",
    },
  ]);
  const generate = useGenerate();

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 420);
    const hasSeenOnboarding = window.localStorage.getItem(ONBOARDING_KEY);

    if (!hasSeenOnboarding) {
      window.setTimeout(() => setShowOnboarding(true), 520);
    }

    return () => window.clearTimeout(timer);
  }, []);

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allTemplates
      .filter((template) => template.id.startsWith(`${industrySlug}-`))
      .filter((template) =>
        typeFilter === "all" ? true : template.kind === typeFilter,
      )
      .filter((template) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          getTemplateTitle(template),
          getTemplateDescription(template),
          template.id,
          template.category,
          ...template.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 32);
  }, [industrySlug, query, typeFilter]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();

  useEffect(() => {
    if (
      selectedTemplateId &&
      filteredTemplates.some((template) => template.id === selectedTemplateId)
    ) {
      return;
    }

    setSelectedTemplateId(filteredTemplates[0]?.id);
  }, [filteredTemplates, selectedTemplateId]);

  const selectedTemplate = useMemo(
    () =>
      allTemplates.find((template) => template.id === selectedTemplateId) ??
      filteredTemplates[0],
    [filteredTemplates, selectedTemplateId],
  );

  const isLipSync = selectedTemplate?.kind === "lip_sync";
  const isGenerating =
    generation &&
    ["pending", "queued", "generating", "post_processing"].includes(
      generation.status,
    );

  const handleGenerationUpdate = useCallback(
    (nextGeneration: GenerationRealtimePayload) => {
      setGeneration((current) =>
        current ? { ...current, ...nextGeneration } : nextGeneration,
      );
    },
    [],
  );

  useGenerationRealtime(generation?.id, handleGenerationUpdate);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];

    if (!file) {
      toast.error("没有读取到文件，请重新选择。");
      return;
    }

    setAsset((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
      }

      return {
        file,
        type: file.type.startsWith("video/") ? "video" : "image",
        url: URL.createObjectURL(file),
      };
    });

    toast.success("素材已上传，已生成本地预览。");
  }, []);

  useEffect(() => {
    return () => {
      if (asset) {
        URL.revokeObjectURL(asset.url);
      }
    };
  }, [asset]);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "video/*": [".mp4", ".mov", ".webm"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    onDrop,
    onDropRejected: () => {
      toast.error("文件格式或大小不符合要求，最大支持 50MB。");
    },
  });

  function closeOnboarding() {
    window.localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
    toast.success("引导已完成，可以开始创作。");
  }

  async function handleGenerate() {
    if (!selectedTemplate || generate.isPending) {
      return;
    }

    if (isLipSync && !lipSyncText.trim()) {
      toast.error("数字人口播需要先输入新的口播文案。");
      return;
    }

    const generationId = crypto.randomUUID();
    const queued: GenerationRealtimePayload = {
      id: generationId,
      status: "queued",
      progress: 0,
      phase: "queued",
      message: "排队中",
      retryCount: 0,
    };

    setGeneration(queued);
    toast.loading("任务已提交，正在进入生成队列。", { id: generationId });

    await waitForRealtimeSubscription();

    const result = await generate.mutateAsync({
      assetIds: asset ? [`local-${asset.file.name}`] : [`demo-${generationId}`],
      generationId,
      inputText: isLipSync ? lipSyncText.trim() : undefined,
      mode: selectedTemplate.mode,
      prompt: [
        prompt.trim(),
        isLipSync ? `口播文案：${lipSyncText.trim()}` : "",
        isLipSync ? `声音：${voice}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      templateId: selectedTemplate.id,
    });

    if (!result.ok) {
      const message = result.error ?? "生成失败";
      handleGenerationUpdate({
        id: generationId,
        status: "failed",
        progress: 100,
        phase: "failed",
        message,
        errorMessage: message,
      });

      toast.error(message, { id: generationId });

      if (result.status === 402 || isCreditsError(message)) {
        setShowCreditsDialog(true);
      }

      return;
    }

    const completed: GenerationRealtimePayload = {
      id: result.data?.generationId ?? generationId,
      status: "completed",
      progress: 100,
      phase: "completed",
      message: "生成完成",
      outputImageUrl:
        result.data?.outputImageUrl ?? selectedTemplate.previewImage,
      outputVideoUrl: result.data?.outputVideoUrl,
    };

    handleGenerationUpdate(completed);
    setHistory((current) => [
      {
        id: completed.id,
        title: getTemplateTitle(selectedTemplate),
        status: "已完成",
        thumbnail: completed.outputImageUrl ?? selectedTemplate.previewImage,
        time: "刚刚",
      },
      ...current.slice(0, 7),
    ]);
    toast.success("生成完成，结果已加入历史记录。", { id: generationId });
  }

  if (isBooting) {
    return <FullPageLoadingSkeleton />;
  }

  return (
    <>
      <section className="min-h-[calc(100svh-8rem)] w-full overflow-hidden rounded-none border-y border-[#171510]/10 bg-white/58 shadow-[0_18px_56px_rgba(23,21,16,0.10)] backdrop-blur sm:rounded-lg sm:border">
        <div
          className={cn(
            "grid min-h-[calc(100svh-8rem)]",
            sidebarOpen
              ? "md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_280px] 2xl:grid-cols-[340px_minmax(0,1fr)_300px]"
              : "md:grid-cols-[72px_minmax(0,1fr)] lg:grid-cols-[72px_minmax(0,1fr)_280px] 2xl:grid-cols-[76px_minmax(0,1fr)_300px]",
          )}
        >
          <aside className="order-1 border-b border-[#171510]/10 bg-[#f8f4ea]/88 p-3 md:border-b-0 md:border-r xl:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              {sidebarOpen ? (
                <div>
                  <p className="text-xs font-semibold text-[#81662b]">
                    模板库
                  </p>
                  <h2 className="text-base font-semibold text-[#171510]">
                    行业与类型
                  </h2>
                </div>
              ) : null}
              <Button
                aria-label={sidebarOpen ? "折叠左侧栏" : "展开左侧栏"}
                onClick={() => setSidebarOpen((value) => !value)}
                className="hidden md:inline-flex"
                size="icon"
                type="button"
                variant="outline"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="size-4" />
                ) : (
                  <PanelLeftOpen className="size-4" />
                )}
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[48px_minmax(0,1fr)] xl:gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0">
                {industryOptions.map((item) => (
                  <button
                    aria-label={item.label}
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-md border transition xl:size-12",
                      industrySlug === item.slug
                        ? "border-[#81662b]/50 bg-[#171510] text-[#d7bd7a]"
                        : "border-[#171510]/10 bg-white/70 text-[#171510]/58 hover:bg-white",
                    )}
                    key={item.slug}
                    onClick={() => {
                      setIndustrySlug(item.slug);
                      toast.success(`已切换到${item.label}模板。`);
                    }}
                    title={item.label}
                    type="button"
                  >
                    <item.icon className="size-5" />
                  </button>
                ))}
              </div>

              {sidebarOpen ? (
                <div className="min-w-0 space-y-4">
                  <div className="grid gap-2">
                    <p className="text-xs font-semibold text-[#171510]/50">
                      类型筛选
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
                      {typeFilters.map((item) => (
                        <button
                          className={cn(
                            "flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition sm:shrink",
                            typeFilter === item.value
                              ? "border-[#81662b]/50 bg-[#efe1b9] text-[#171510]"
                              : "border-[#171510]/10 bg-white/62 text-[#171510]/58 hover:bg-white",
                          )}
                          key={item.value}
                          onClick={() => setTypeFilter(item.value)}
                          type="button"
                        >
                          <item.icon className="size-4" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#171510]/38" />
                    <Input
                      className="min-h-11 pl-9"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="搜索模板、风格、行业"
                      value={query}
                    />
                  </label>

                  <div className="flex gap-3 overflow-x-auto pb-2 pr-0 sm:grid sm:max-h-[calc(100vh-23rem)] sm:min-h-48 sm:gap-2 sm:overflow-y-auto sm:pb-0 sm:pr-1">
                    {filteredTemplates.map((template) => (
                      <TemplateListItem
                        isSelected={selectedTemplate?.id === template.id}
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          toast.success(`已选择：${getTemplateTitle(template)}`);
                        }}
                        template={template}
                      />
                    ))}
                    {!filteredTemplates.length ? (
                      <EmptyState
                        className="min-w-[260px] sm:min-w-0"
                        title="没有匹配模板"
                        description="换一个行业、类型或搜索词试试。"
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>

          <main className="order-2 min-w-0 bg-[#f6f0e4]/72 p-3 sm:p-5 xl:p-6">
            <div className="grid gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#81662b]">
                    {industryBySlug[industrySlug]}
                  </p>
                  <h2 className="text-2xl font-semibold text-[#171510]">
                    {selectedTemplate
                      ? getTemplateTitle(selectedTemplate)
                      : "选择一个模板"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-[#171510]/58">
                    {selectedTemplate
                      ? getTemplateDescription(selectedTemplate)
                      : "左侧选择行业和模板，上传素材后开始生成。"}
                  </p>
                </div>
                <div className="rounded-full border border-[#171510]/10 bg-white/62 px-3 py-1.5 text-sm font-semibold text-[#81662b]">
                  {selectedTemplate?.creditCost ?? 0} credits
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
                <div className="grid gap-5">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex min-h-[52svh] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition sm:min-h-56 xl:min-h-64 xl:p-8",
                      isDragActive
                        ? "border-[#81662b] bg-[#efe1b9]"
                        : "border-[#171510]/14 bg-white/68 hover:bg-white/82",
                    )}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud className="mb-3 size-9 text-[#81662b]" />
                    <p className="text-base font-semibold text-[#171510]">
                      拖拽上传图片或视频
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#171510]/58">
                      支持 JPG、PNG、WebP、MP4、MOV、WebM。口播视频最长 30
                      秒，最大 50MB。
                    </p>
                    {asset ? (
                      <span className="mt-4 rounded-full bg-[#171510] px-3 py-1 text-xs font-medium text-white">
                        {asset.file.name}
                      </span>
                    ) : null}
                  </div>

                  <PreviewPanel asset={asset} template={selectedTemplate} />

                  {isLipSync ? (
                    <div className="grid gap-4 rounded-lg border border-[#171510]/10 bg-white/70 p-4">
                      <div>
                        <h3 className="text-base font-semibold text-[#171510]">
                          数字人口播设置
                        </h3>
                        <p className="mt-1 text-sm text-[#171510]/54">
                          上传原口播视频，输入新文案并选择声音风格。
                        </p>
                      </div>
                      <Textarea
                        className="min-h-32"
                        maxLength={300}
                        onChange={(event) => setLipSyncText(event.target.value)}
                        placeholder="输入新的口播文案，AI 帮你对上口型"
                        value={lipSyncText}
                      />
                      <label className="grid gap-2 text-sm font-medium text-[#171510]">
                        声音选择
                        <select
                          className="min-h-11 rounded-xl border border-input bg-white/70 px-3 text-sm"
                          onChange={(event) =>
                            setVoice(event.target.value as typeof voice)
                          }
                          value={voice}
                        >
                          {voiceOptions.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : null}
                </div>

                <div className="grid content-start gap-4 rounded-lg border border-[#171510]/10 bg-white/70 p-5">
                  <div>
                    <h3 className="text-base font-semibold text-[#171510]">
                      生成设置
                    </h3>
                    <p className="mt-1 text-sm text-[#171510]/54">
                      Prompt 可选，不填写也会按模板默认参数生成。
                    </p>
                  </div>
                  <Textarea
                    className="min-h-36"
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="补充产品卖点、风格、活动信息，例如：春季新款、通勤风、突出面料质感。"
                    value={prompt}
                  />
                  <Button
                    className="h-12 rounded-md bg-[#171510] text-base text-white hover:bg-[#2a251b]"
                    disabled={!selectedTemplate || generate.isPending}
                    onClick={handleGenerate}
                    type="button"
                  >
                    {generate.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <WandSparkles className="size-5" />
                    )}
                    {generate.isPending ? "生成中..." : "开始生成"}
                  </Button>

                  <div className="rounded-md border border-[#171510]/10 bg-[#f8f4ea] p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#171510]">
                        {generation?.message ?? "等待开始"}
                      </span>
                      <span className="font-mono text-[#171510]/48">
                        {generation?.progress ?? 0}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#171510]/10">
                      <div
                        className={cn(
                          "h-full rounded-full bg-[#81662b] transition-all",
                          isGenerating ? "animate-pulse" : "",
                        )}
                        style={{ width: `${generation?.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {generation?.status === "failed" ? (
                    <ErrorState
                      message={generation.errorMessage || "生成失败，请重试。"}
                      onRetry={handleGenerate}
                    />
                  ) : isGenerating ? (
                    <GenerationInlinePlaceholder />
                  ) : null}
                </div>
              </div>
            </div>
          </main>

          <aside className="order-3 border-t border-[#171510]/10 bg-[#f8f4ea]/86 p-4 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 xl:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#81662b]">
                  历史生成
                </p>
                <h2 className="text-base font-semibold text-[#171510]">
                  最近作品
                </h2>
              </div>
              <ChevronRight className="size-4 text-[#171510]/36" />
            </div>

            <div className="grid max-h-[260px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3 lg:max-h-[calc(100vh-14rem)] lg:grid-cols-1">
              {history.length ? (
                history.map((item) => (
                  <button
                    className="grid min-h-24 grid-cols-[76px_1fr] gap-3 rounded-md border border-[#171510]/10 bg-white/68 p-2.5 text-left transition hover:bg-white 2xl:grid-cols-[88px_1fr]"
                    key={item.id}
                    type="button"
                  >
                    <span className="relative aspect-square overflow-hidden rounded-md bg-[#ebe3d4]">
                      <Image
                        alt={item.title}
                        className="object-cover"
                        fill
                        sizes="88px"
                        src={item.thumbnail}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#171510]">
                        {item.title}
                      </span>
                      <span className="mt-1 block text-xs text-[#171510]/48">
                        {item.status} · {item.time}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <EmptyState
                  title="还没有历史作品"
                  description="生成完成后会自动出现在这里。"
                />
              )}
            </div>
          </aside>
        </div>
      </section>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{onboardingSteps[onboardingIndex].title}</DialogTitle>
            <DialogDescription>
              {onboardingSteps[onboardingIndex].description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2">
            {onboardingSteps.map((step, index) => (
              <button
                aria-label={step.title}
                className={cn(
                  "h-2 rounded-full transition",
                  index <= onboardingIndex ? "bg-[#171510]" : "bg-[#171510]/12",
                )}
                key={step.title}
                onClick={() => setOnboardingIndex(index)}
                type="button"
              />
            ))}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              onClick={closeOnboarding}
              type="button"
              variant="outline"
            >
              跳过
            </Button>
            <Button
              onClick={() => {
                if (onboardingIndex === onboardingSteps.length - 1) {
                  closeOnboarding();
                  return;
                }
                setOnboardingIndex((value) => value + 1);
              }}
              type="button"
            >
              {onboardingIndex === onboardingSteps.length - 1
                ? "开始创作"
                : "下一步"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showCreditsDialog}
        onOpenChange={setShowCreditsDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <WalletCards className="size-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Credits 不足</AlertDialogTitle>
            <AlertDialogDescription>
              当前额度不足以完成这次生成。购买额度包后可以继续生成，已失败的任务不会重复扣费。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>稍后再说</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.location.href = "/zh-CN/pricing";
              }}
            >
              去购买额度
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TemplateListItem({
  isSelected,
  onClick,
  template,
}: {
  isSelected: boolean;
  onClick: () => void;
  template: Template;
}) {
  return (
    <button
      className={cn(
        "grid w-[220px] shrink-0 grid-cols-[72px_1fr] gap-3 rounded-md border p-2.5 text-left transition sm:w-full sm:shrink sm:grid-cols-[78px_1fr] xl:grid-cols-[88px_1fr]",
        isSelected
          ? "border-[#81662b]/50 bg-[#efe1b9]"
          : "border-[#171510]/10 bg-white/62 hover:bg-white",
      )}
      onClick={onClick}
      type="button"
    >
      <span className="relative aspect-square overflow-hidden rounded-md bg-[#ebe3d4]">
        <Image
          alt={getTemplateTitle(template)}
          className="object-cover"
          fill
          sizes="88px"
          src={template.previewImage}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#171510]">
          {getTemplateTitle(template)}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#171510]/52">
          {getTemplateDescription(template)}
        </span>
        <span className="mt-2 inline-flex rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-[#81662b]">
          {template.creditCost} credits
        </span>
      </span>
    </button>
  );
}

function PreviewPanel({
  asset,
  template,
}: {
  asset: UploadedAsset | null;
  template?: Template;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#171510]/10 bg-white/70">
      <div className="flex items-center justify-between gap-3 border-b border-[#171510]/10 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#171510]">预览</h3>
          <p className="truncate text-sm text-[#171510]/52">
            {asset ? asset.file.name : "未上传素材时显示模板预览"}
          </p>
        </div>
        <span className="rounded-full bg-[#f8f4ea] px-3 py-1 text-xs font-medium text-[#81662b]">
          {asset?.type ?? template?.kind ?? "image"}
        </span>
      </div>
      <div className="relative aspect-video bg-[#ebe3d4]">
        {asset?.type === "video" ? (
          <video
            className="size-full bg-black object-contain"
            controls
            src={asset.url}
          >
            <track kind="captions" />
          </video>
        ) : asset?.type === "image" ? (
          // Blob URL is local-only, so use a plain img instead of next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={asset.file.name}
            className="size-full object-cover"
            src={asset.url}
          />
        ) : (
          <Image
            alt={template ? getTemplateTitle(template) : "模板预览"}
            className="object-cover"
            fill
            sizes="(min-width: 1280px) 720px, 100vw"
            src={template?.previewImage ?? "/templates/fashion-campaign-v2.png"}
          />
        )}
      </div>
    </div>
  );
}

function GenerationInlinePlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-md border border-[#171510]/10 bg-[#f8ead0] p-4">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.55),transparent)] animate-pulse" />
      <div className="relative flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-[#171510] text-white">
          <Loader2 className="size-5 animate-spin" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#171510]">
            正在生成，请勿关闭页面
          </p>
          <p className="mt-1 text-xs text-[#171510]/58">
            完成后会自动更新预览、历史记录和导出入口。
          </p>
        </div>
      </div>
    </div>
  );
}
