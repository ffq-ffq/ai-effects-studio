"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const industries = [
  { label: "服装", icon: Shirt },
  { label: "餐饮", icon: Store },
  { label: "房产", icon: Store },
  { label: "培训", icon: UserRound },
  { label: "零售", icon: Store },
  { label: "自媒体", icon: Megaphone },
  { label: "外贸", icon: Sparkles },
  { label: "宠物", icon: Sparkles },
  { label: "美业", icon: WandSparkles },
  { label: "婚庆", icon: Sparkles },
] as const;

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

export function StudioWorkbench() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [industry, setIndustry] = useState("服装");
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

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allTemplates
      .filter((template) => template.industry === industry)
      .filter((template) =>
        typeFilter === "all" ? true : template.kind === typeFilter,
      )
      .filter((template) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          template.title,
          template.description,
          template.industry,
          template.category,
          ...template.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .slice(0, 32);
  }, [industry, query, typeFilter]);

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
  });

  async function handleGenerate() {
    if (!selectedTemplate || generate.isPending) {
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

    await waitForRealtimeSubscription();

    const result = await generate.mutateAsync({
      assetIds: asset ? [`local-${asset.file.name}`] : [`demo-${generationId}`],
      generationId,
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
      handleGenerationUpdate({
        id: generationId,
        status: "failed",
        progress: 100,
        phase: "failed",
        message: "生成失败，credits 已自动退还",
        errorMessage: result.error ?? "Generation failed",
      });
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
        title: selectedTemplate.title,
        status: "已完成",
        thumbnail: completed.outputImageUrl ?? selectedTemplate.previewImage,
        time: "刚刚",
      },
      ...current.slice(0, 7),
    ]);
  }

  return (
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
                <p className="text-xs font-semibold text-[#81662b]">模板库</p>
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
            <div className="flex gap-2 overflow-x-auto md:grid md:overflow-visible">
              {industries.map((item) => (
                <button
                  aria-label={item.label}
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-md border transition xl:size-12",
                    industry === item.label
                      ? "border-[#81662b]/50 bg-[#171510] text-[#d7bd7a]"
                      : "border-[#171510]/10 bg-white/70 text-[#171510]/58 hover:bg-white",
                  )}
                  key={item.label}
                  onClick={() => setIndustry(item.label)}
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
                          "flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition sm:shrink",
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
                    className="pl-9"
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
                      onClick={() => setSelectedTemplateId(template.id)}
                      template={template}
                    />
                  ))}
                  {!filteredTemplates.length ? (
                    <div className="rounded-md border border-dashed border-[#171510]/12 bg-white/44 p-4 text-sm text-[#171510]/52">
                      没有匹配模板，换一个行业或类型试试。
                    </div>
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
                  {selectedTemplate?.industry ?? industry}
                </p>
                <h2 className="text-2xl font-semibold text-[#171510]">
                  {selectedTemplate?.title ?? "选择一个模板"}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#171510]/58">
                  {selectedTemplate?.description ??
                    "左侧选择行业和模板，上传素材后开始生成。"}
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
                    支持 JPG、PNG、WebP、MP4、MOV、WebM。口播视频最长 30 秒，最大 50MB。
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
                      onChange={(event) => setLipSyncText(event.target.value)}
                      placeholder="输入新的口播文案，AI 帮你对上口型"
                      value={lipSyncText}
                    />
                    <label className="grid gap-2 text-sm font-medium text-[#171510]">
                      声音选择
                      <select
                        className="h-10 rounded-xl border border-input bg-white/70 px-3 text-sm"
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
                      className="h-full rounded-full bg-[#81662b] transition-all"
                      style={{ width: `${generation?.progress ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="order-3 border-t border-[#171510]/10 bg-[#f8f4ea]/86 p-4 md:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 xl:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#81662b]">历史生成</p>
              <h2 className="text-base font-semibold text-[#171510]">
                最近作品
              </h2>
            </div>
            <ChevronRight className="size-4 text-[#171510]/36" />
          </div>

          <div className="grid max-h-[260px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 md:grid-cols-3 lg:max-h-[calc(100vh-14rem)] lg:grid-cols-1">
            {history.map((item) => (
              <button
                className="grid grid-cols-[76px_1fr] gap-3 rounded-md border border-[#171510]/10 bg-white/68 p-2.5 text-left transition hover:bg-white 2xl:grid-cols-[88px_1fr]"
                key={item.id}
                type="button"
              >
                <span className="relative aspect-square overflow-hidden rounded-md bg-[#ebe3d4]">
                  <Image
                    alt={item.title}
                    className="object-cover"
                    fill
                    sizes="72px"
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
            ))}
          </div>
        </aside>
      </div>
    </section>
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
          alt={template.title}
          className="object-cover"
          fill
          sizes="72px"
          src={template.previewImage}
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#171510]">
          {template.title}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#171510]/52">
          {template.description}
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
      <div className="flex items-center justify-between border-b border-[#171510]/10 px-4 py-3">
        <div>
          <h3 className="text-base font-semibold text-[#171510]">预览</h3>
          <p className="text-sm text-[#171510]/52">
            {asset ? asset.file.name : "未上传素材时显示模板预览"}
          </p>
        </div>
        <span className="rounded-full bg-[#f8f4ea] px-3 py-1 text-xs font-medium text-[#81662b]">
          {asset?.type ?? template?.kind ?? "image"}
        </span>
      </div>
      <div className="relative aspect-video bg-[#ebe3d4]">
        {asset?.type === "video" ? (
          <video className="size-full bg-black object-contain" controls src={asset.url}>
            <track kind="captions" />
          </video>
        ) : (
          <Image
            alt={asset ? asset.file.name : template?.title ?? "模板预览"}
            className="object-cover"
            fill
            sizes="(min-width: 1280px) 720px, 100vw"
            src={asset?.url ?? template?.previewImage ?? "/templates/fashion-campaign-v2.png"}
          />
        )}
      </div>
    </div>
  );
}
