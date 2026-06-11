"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  ImagePlus,
  Layers3,
  RotateCcw,
  RotateCw,
  Scissors,
  SmilePlus,
  Type,
  Undo2,
  Redo2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FabricModule = typeof import("fabric");
type FabricCanvas = InstanceType<FabricModule["Canvas"]>;
type FabricObject = ReturnType<FabricCanvas["getObjects"]>[number];

type LayerItem = {
  id: string;
  label: string;
  type: string;
};

type ExportFormat = "png" | "jpeg";

const stickers = ["🔥", "✨", "💥", "🛒", "新品", "限时", "爆款", "包邮"];
const cropPresets = [
  { id: "free", label: "自由", width: 960, height: 640 },
  { id: "1:1", label: "1:1", width: 720, height: 720 },
  { id: "3:4", label: "3:4", width: 720, height: 960 },
  { id: "4:3", label: "4:3", width: 960, height: 720 },
  { id: "9:16", label: "9:16", width: 540, height: 960 },
  { id: "16:9", label: "16:9", width: 960, height: 540 },
] as const;

function getObjectId(object: FabricObject): string {
  const record = object as FabricObject & { data?: { id?: string } };

  if (!record.data?.id) {
    record.data = {
      ...(record.data ?? {}),
      id: crypto.randomUUID(),
    };
  }

  return record.data.id ?? crypto.randomUUID();
}

function getLayerLabel(object: FabricObject, index: number) {
  const record = object as FabricObject & { text?: string };

  if (record.text) {
    return record.text.slice(0, 12);
  }

  if (object.type === "image") {
    return `图片 ${index + 1}`;
  }

  if (object.type === "rect") {
    return `裁剪框 ${index + 1}`;
  }

  return `图层 ${index + 1}`;
}

function downloadUrl(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
}

export function CanvasEditor() {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);
  const fabricRef = useRef<FabricModule | null>(null);
  const historyRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const restoringRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [ready, setReady] = useState(false);
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState("free");
  const [angle, setAngle] = useState(0);
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    sharpness: 0,
  });
  const [textOptions, setTextOptions] = useState({
    text: "新品上新",
    fontFamily: "Noto Sans SC",
    fill: "#123c36",
    fontSize: 48,
    stroke: "#ffffff",
    strokeWidth: 2,
    shadow: true,
  });
  const [exportOptions, setExportOptions] = useState<{
    format: ExportFormat;
    quality: number;
    multiplier: number;
  }>({
    format: "png",
    quality: 0.92,
    multiplier: 1,
  });

  const canUndo = historyRef.current.length > 1;
  const canRedo = redoRef.current.length > 0;

  const syncLayers = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const objects = canvas.getObjects();
    const active = canvas.getActiveObject();

    setLayers(
      objects
        .map((object, index) => ({
          id: getObjectId(object),
          label: getLayerLabel(object, index),
          type: object.type ?? "object",
        }))
        .reverse(),
    );
    setActiveId(active ? getObjectId(active) : null);
  }, []);

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || restoringRef.current) {
      return;
    }

    const snapshot = JSON.stringify(
      (canvas as FabricCanvas & { toJSON: (properties?: string[]) => unknown }).toJSON([
        "data",
      ]),
    );
    const last = historyRef.current[historyRef.current.length - 1];

    if (snapshot !== last) {
      historyRef.current = [...historyRef.current, snapshot].slice(-40);
      redoRef.current = [];
    }

    syncLayers();
  }, [syncLayers]);

  const loadSnapshot = useCallback(
    async (snapshot: string) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      restoringRef.current = true;
      await canvas.loadFromJSON(snapshot);
      canvas.renderAll();
      restoringRef.current = false;
      syncLayers();
    },
    [syncLayers],
  );

  const addDemoArtwork = useCallback((fabric: FabricModule, canvas: FabricCanvas) => {
    const background = new fabric.Rect({
      left: 80,
      top: 70,
      width: 520,
      height: 520,
      fill: "#e8dcc1",
      rx: 16,
      ry: 16,
      data: { id: crypto.randomUUID() },
    });
    const product = new fabric.Rect({
      left: 230,
      top: 140,
      width: 220,
      height: 330,
      fill: "#245c51",
      rx: 14,
      ry: 14,
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.18)",
        blur: 30,
        offsetY: 18,
      }),
      data: { id: crypto.randomUUID() },
    });
    const label = new fabric.Textbox("AI 生成图\n可在本地编辑", {
      left: 120,
      top: 560,
      width: 520,
      fontFamily: "Noto Sans SC",
      fontSize: 34,
      fill: "#183b36",
      textAlign: "center",
      data: { id: crypto.randomUUID() },
    });

    canvas.add(background, product, label);
    canvas.centerObject(label);
    canvas.setActiveObject(product);
    canvas.renderAll();
  }, []);

  useEffect(() => {
    let disposed = false;

    async function bootCanvas() {
      const fabric = await import("fabric");

      if (!canvasElementRef.current || disposed) {
        return;
      }

      fabricRef.current = fabric;
      const canvas = new fabric.Canvas(canvasElementRef.current, {
        width: 960,
        height: 640,
        backgroundColor: "#f8f4e8",
        preserveObjectStacking: true,
      });
      canvasRef.current = canvas;

      addDemoArtwork(fabric, canvas);
      pushHistory();
      syncLayers();

      canvas.on("object:added", pushHistory);
      canvas.on("object:modified", pushHistory);
      canvas.on("object:removed", pushHistory);
      canvas.on("selection:created", syncLayers);
      canvas.on("selection:updated", syncLayers);
      canvas.on("selection:cleared", syncLayers);

      setReady(true);
    }

    void bootCanvas();

    return () => {
      disposed = true;
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, [addDemoArtwork, pushHistory, syncLayers]);

  function setCropPreset(presetId: string) {
    const canvas = canvasRef.current;
    const fabric = fabricRef.current;
    const preset = cropPresets.find((item) => item.id === presetId);

    if (!canvas || !fabric || !preset) {
      return;
    }

    setCropMode(presetId);
    canvas.setDimensions({ width: preset.width, height: preset.height });

    canvas
      .getObjects()
      .filter((object) => (object as FabricObject & { data?: { role?: string } }).data?.role === "crop-guide")
      .forEach((object) => canvas.remove(object));

    if (presetId !== "free") {
      canvas.add(
        new fabric.Rect({
          left: 24,
          top: 24,
          width: preset.width - 48,
          height: preset.height - 48,
          fill: "transparent",
          stroke: "#2f8f7b",
          strokeDashArray: [10, 8],
          selectable: false,
          evented: false,
          data: { id: crypto.randomUUID(), role: "crop-guide" },
        }),
      );
    }

    canvas.renderAll();
    pushHistory();
  }

  function rotateActive(nextAngle: number) {
    const object = canvasRef.current?.getActiveObject();

    if (!object) {
      toast.error("请先选择一个图层");
      return;
    }

    setAngle(nextAngle);
    object.rotate(nextAngle);
    object.setCoords();
    canvasRef.current?.renderAll();
    pushHistory();
  }

  function rotateBy(delta: number) {
    const object = canvasRef.current?.getActiveObject();
    const currentAngle = object?.angle ?? 0;
    rotateActive(currentAngle + delta);
  }

  function flipActive(axis: "x" | "y") {
    const object = canvasRef.current?.getActiveObject();

    if (!object) {
      toast.error("请先选择一个图层");
      return;
    }

    if (axis === "x") {
      object.set("flipX", !object.flipX);
    } else {
      object.set("flipY", !object.flipY);
    }

    canvasRef.current?.renderAll();
    pushHistory();
  }

  function applyImageFilters(nextFilters = filters) {
    const fabric = fabricRef.current;
    const object = canvasRef.current?.getActiveObject() as
      | (FabricObject & {
          filters?: unknown[];
          applyFilters?: () => void;
        })
      | undefined;

    if (!fabric || !object || object.type !== "image" || !object.applyFilters) {
      return;
    }

    const filterList: unknown[] = [
      new fabric.filters.Brightness({ brightness: nextFilters.brightness / 100 }),
      new fabric.filters.Contrast({ contrast: nextFilters.contrast / 100 }),
      new fabric.filters.Saturation({ saturation: nextFilters.saturation / 100 }),
      new fabric.filters.HueRotation({ rotation: nextFilters.temperature / 180 }),
    ];

    if (nextFilters.sharpness > 0) {
      filterList.push(
        new fabric.filters.Convolute({
          matrix: [0, -1, 0, -1, 5 + nextFilters.sharpness / 20, -1, 0, -1, 0],
        }),
      );
    }

    object.filters = filterList;
    object.applyFilters();
    canvasRef.current?.renderAll();
  }

  function updateFilter(name: keyof typeof filters, value: number) {
    const next = { ...filters, [name]: value };
    setFilters(next);
    applyImageFilters(next);
  }

  function commitFilters() {
    pushHistory();
    toast.success("滤镜已应用");
  }

  function addText() {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;

    if (!fabric || !canvas) {
      return;
    }

    const text = new fabric.Textbox(textOptions.text || "输入文字", {
      left: 120,
      top: 120,
      width: 360,
      fontFamily: textOptions.fontFamily,
      fontSize: textOptions.fontSize,
      fill: textOptions.fill,
      stroke: textOptions.stroke,
      strokeWidth: textOptions.strokeWidth,
      shadow: textOptions.shadow
        ? new fabric.Shadow({
            color: "rgba(0,0,0,0.25)",
            blur: 12,
            offsetX: 2,
            offsetY: 4,
          })
        : undefined,
      data: { id: crypto.randomUUID() },
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    pushHistory();
  }

  function addSticker(sticker: string) {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;

    if (!fabric || !canvas) {
      return;
    }

    const object = new fabric.Textbox(sticker, {
      left: 160,
      top: 160,
      width: 180,
      fontFamily: "Noto Sans SC",
      fontSize: sticker.length <= 2 ? 72 : 48,
      fill: "#ef4444",
      stroke: "#ffffff",
      strokeWidth: sticker.length <= 2 ? 0 : 2,
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.22)",
        blur: 18,
        offsetY: 8,
      }),
      data: { id: crypto.randomUUID() },
    });

    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.renderAll();
    pushHistory();
  }

  async function uploadImage(file: File) {
    const fabric = fabricRef.current;
    const canvas = canvasRef.current;

    if (!fabric || !canvas) {
      return;
    }

    const url = URL.createObjectURL(file);
    const image = await fabric.FabricImage.fromURL(url);
    URL.revokeObjectURL(url);

    image.set({
      left: 140,
      top: 100,
      scaleX: Math.min(520 / (image.width || 520), 1),
      scaleY: Math.min(520 / (image.height || 520), 1),
      data: { id: crypto.randomUUID() },
    });
    canvas.add(image);
    canvas.setActiveObject(image);
    canvas.renderAll();
    pushHistory();
  }

  function selectLayer(id: string) {
    const canvas = canvasRef.current;
    const target = canvas?.getObjects().find((object) => getObjectId(object) === id);

    if (canvas && target) {
      canvas.setActiveObject(target);
      canvas.renderAll();
      syncLayers();
    }
  }

  function moveActive(direction: "up" | "down") {
    const canvas = canvasRef.current;
    const object = canvas?.getActiveObject();

    if (!canvas || !object) {
      return;
    }

    if (direction === "up") {
      canvas.bringObjectForward(object);
    } else {
      canvas.sendObjectBackwards(object);
    }

    canvas.renderAll();
    pushHistory();
  }

  function removeActive() {
    const canvas = canvasRef.current;
    const object = canvas?.getActiveObject();

    if (canvas && object) {
      canvas.remove(object);
      canvas.discardActiveObject();
      canvas.renderAll();
      pushHistory();
    }
  }

  function undo() {
    if (historyRef.current.length <= 1) {
      return;
    }

    const current = historyRef.current.pop();
    const previous = historyRef.current[historyRef.current.length - 1];

    if (current && previous) {
      redoRef.current.push(current);
      void loadSnapshot(previous);
    }
  }

  function redo() {
    const next = redoRef.current.pop();

    if (next) {
      historyRef.current.push(next);
      void loadSnapshot(next);
    }
  }

  function exportCanvas() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL({
      format: exportOptions.format,
      quality: exportOptions.quality,
      multiplier: exportOptions.multiplier,
    });
    downloadUrl(
      url,
      `ai-effects-edit.${exportOptions.format === "jpeg" ? "jpg" : "png"}`,
    );
  }

  return (
    <section className="grid min-w-0 gap-4">
      <div className="min-w-0 rounded-md border bg-card p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button className="min-h-10" disabled={!canUndo} onClick={undo} size="sm" variant="outline">
            <Undo2 className="size-4" />
            撤销
          </Button>
          <Button className="min-h-10" disabled={!canRedo} onClick={redo} size="sm" variant="outline">
            <Redo2 className="size-4" />
            重做
          </Button>
          <Button
            className="min-h-10"
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
          >
            <ImagePlus className="size-4" />
            上传图片
          </Button>
          <input
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadImage(file);
              event.target.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
          <Button className="min-h-10" onClick={exportCanvas} size="sm">
            <Download className="size-4" />
            导出
          </Button>
          <span className="text-xs text-muted-foreground">
            客户端处理，不消耗 credits
          </span>
        </div>

        <div className="max-w-full overflow-x-auto rounded-md bg-muted/50 p-3">
          <div className="w-max">
            <canvas ref={canvasElementRef} />
          </div>
        </div>
        {!ready ? (
          <p className="mt-3 text-sm text-muted-foreground">编辑器加载中...</p>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="裁剪" icon={Scissors}>
            <div className="flex flex-wrap gap-2">
              {cropPresets.map((preset) => (
                <Button
                  className="min-h-10"
                  key={preset.id}
                  onClick={() => setCropPreset(preset.id)}
                  size="sm"
                  type="button"
                  variant={cropMode === preset.id ? "default" : "outline"}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </Panel>

          <Panel title="旋转 / 翻转" icon={RotateCw}>
            <div className="flex flex-wrap gap-2">
              <Button
                className="min-h-10"
                onClick={() => rotateBy(90)}
                size="sm"
                type="button"
                variant="outline"
              >
                <RotateCw className="size-4" />
                90°
              </Button>
              <Button
                className="min-h-10"
                onClick={() => rotateBy(-90)}
                size="sm"
                type="button"
                variant="outline"
              >
                <RotateCcw className="size-4" />
                -90°
              </Button>
              <Button
                className="min-h-10"
                onClick={() => flipActive("x")}
                size="sm"
                type="button"
                variant="outline"
              >
                <FlipHorizontal2 className="size-4" />
                水平
              </Button>
              <Button
                className="min-h-10"
                onClick={() => flipActive("y")}
                size="sm"
                type="button"
                variant="outline"
              >
                <FlipVertical2 className="size-4" />
                垂直
              </Button>
            </div>
            <RangeControl
              label="任意角度"
              max={180}
              min={-180}
              onChange={(value) => rotateActive(value)}
              value={angle}
            />
          </Panel>

          <Panel title="滤镜" icon={ImagePlus}>
            <RangeControl
              label="亮度"
              max={100}
              min={-100}
              onChange={(value) => updateFilter("brightness", value)}
              value={filters.brightness}
            />
            <RangeControl
              label="对比度"
              max={100}
              min={-100}
              onChange={(value) => updateFilter("contrast", value)}
              value={filters.contrast}
            />
            <RangeControl
              label="饱和度"
              max={100}
              min={-100}
              onChange={(value) => updateFilter("saturation", value)}
              value={filters.saturation}
            />
            <RangeControl
              label="色温"
              max={100}
              min={-100}
              onChange={(value) => updateFilter("temperature", value)}
              value={filters.temperature}
            />
            <RangeControl
              label="锐度"
              max={100}
              min={0}
              onChange={(value) => updateFilter("sharpness", value)}
              value={filters.sharpness}
            />
            <Button
              className="min-h-10"
              onClick={commitFilters}
              size="sm"
              type="button"
              variant="outline"
            >
              应用滤镜
            </Button>
          </Panel>

          <Panel title="文字" icon={Type}>
            <div className="grid gap-2">
              <Label htmlFor="editor-text">内容</Label>
              <Input
                id="editor-text"
                onChange={(event) =>
                  setTextOptions((current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                }
                value={textOptions.text}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="editor-font">字体</Label>
                <select
                  className="min-h-10 rounded-md border border-input bg-background px-3 text-sm"
                  id="editor-font"
                  onChange={(event) =>
                    setTextOptions((current) => ({
                      ...current,
                      fontFamily: event.target.value,
                    }))
                  }
                  value={textOptions.fontFamily}
                >
                  <option value="Noto Sans SC">Noto Sans SC</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Mono</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editor-color">颜色</Label>
                <Input
                  id="editor-color"
                  onChange={(event) =>
                    setTextOptions((current) => ({
                      ...current,
                      fill: event.target.value,
                    }))
                  }
                  type="color"
                  value={textOptions.fill}
                />
              </div>
            </div>
            <RangeControl
              label="字号"
              max={120}
              min={16}
              onChange={(value) =>
                setTextOptions((current) => ({ ...current, fontSize: value }))
              }
              value={textOptions.fontSize}
            />
            <RangeControl
              label="描边"
              max={10}
              min={0}
              onChange={(value) =>
                setTextOptions((current) => ({ ...current, strokeWidth: value }))
              }
              value={textOptions.strokeWidth}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                checked={textOptions.shadow}
                onChange={(event) =>
                  setTextOptions((current) => ({
                    ...current,
                    shadow: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              阴影
            </label>
            <Button className="min-h-10" onClick={addText} size="sm" type="button">
              添加文字
            </Button>
          </Panel>

          <Panel title="贴纸 / Emoji" icon={SmilePlus}>
            <div className="flex flex-wrap gap-2">
              {stickers.map((sticker) => (
                <Button
                  className="min-h-10 min-w-12"
                  key={sticker}
                  onClick={() => addSticker(sticker)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {sticker}
                </Button>
              ))}
            </div>
          </Panel>

          <Panel title="导出" icon={Download}>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="export-format">格式</Label>
                <select
                  className="min-h-10 rounded-md border border-input bg-background px-3 text-sm"
                  id="export-format"
                  onChange={(event) =>
                    setExportOptions((current) => ({
                      ...current,
                      format: event.target.value as ExportFormat,
                    }))
                  }
                  value={exportOptions.format}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPG</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="export-resolution">分辨率</Label>
                <select
                  className="min-h-10 rounded-md border border-input bg-background px-3 text-sm"
                  id="export-resolution"
                  onChange={(event) =>
                    setExportOptions((current) => ({
                      ...current,
                      multiplier: Number(event.target.value),
                    }))
                  }
                  value={exportOptions.multiplier}
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            </div>
            <RangeControl
              label="质量"
              max={100}
              min={40}
              onChange={(value) =>
                setExportOptions((current) => ({
                  ...current,
                  quality: value / 100,
                }))
              }
              value={Math.round(exportOptions.quality * 100)}
            />
            <Button className="min-h-10" onClick={exportCanvas} type="button">
              <Download className="size-4" />
              导出 JPG/PNG
            </Button>
          </Panel>
        </div>

        <Panel title="图层管理" icon={Layers3}>
          <div className="flex gap-2">
            <Button
              className="min-h-10"
              onClick={() => moveActive("up")}
              size="sm"
              type="button"
              variant="outline"
            >
              <ArrowUp className="size-4" />
              上移
            </Button>
            <Button
              className="min-h-10"
              onClick={() => moveActive("down")}
              size="sm"
              type="button"
              variant="outline"
            >
              <ArrowDown className="size-4" />
              下移
            </Button>
            <Button
              className="min-h-10"
              onClick={removeActive}
              size="sm"
              type="button"
              variant="outline"
            >
              <Trash2 className="size-4" />
              删除
            </Button>
          </div>
          <div className="grid gap-2">
            {layers.map((layer) => (
              <button
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm transition hover:border-primary",
                  layer.id === activeId ? "border-primary bg-primary/5" : "bg-background",
                )}
                key={layer.id}
                onClick={() => selectLayer(layer.id)}
                type="button"
              >
                <span className="block font-medium">{layer.label}</span>
                <span className="text-xs text-muted-foreground">{layer.type}</span>
              </button>
            ))}
          </div>
          {!activeId ? (
            <p className="text-xs text-muted-foreground">选择画布对象后可调整图层。</p>
          ) : null}
        </Panel>
      </div>
    </section>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="grid content-start gap-3 rounded-md border bg-card p-4">
      <h3 className="inline-flex items-center gap-2 font-medium">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function RangeControl({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      </div>
      <input
        className="w-full accent-primary"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
    </div>
  );
}
