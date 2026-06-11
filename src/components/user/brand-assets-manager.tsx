"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Building2,
  Check,
  ImagePlus,
  LockKeyhole,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BrandAsset = {
  id: string;
  name: string;
  logoUrl: string | null;
  colors: string[];
  font: string;
};

const fontOptions = [
  "Noto Sans SC",
  "HarmonyOS Sans",
  "Source Han Serif",
  "PingFang SC",
  "LXGW WenKai",
];

const initialBrands: BrandAsset[] = [
  {
    id: "brand-fashion",
    name: "青禾女装",
    logoUrl: null,
    colors: ["#123c36", "#f2d16b", "#ffffff"],
    font: "Noto Sans SC",
  },
  {
    id: "brand-store",
    name: "本地生活馆",
    logoUrl: null,
    colors: ["#1f2937", "#f59e0b", "#f8fafc"],
    font: "HarmonyOS Sans",
  },
];

const storageKey = "ai-effects-studio-brand-assets";

async function removeLogoBackground(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const maxSize = 512;
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      return objectUrl;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    const [baseR, baseG, baseB] = frame.data;

    for (let index = 0; index < frame.data.length; index += 4) {
      const r = frame.data[index];
      const g = frame.data[index + 1];
      const b = frame.data[index + 2];
      const distance = Math.abs(r - baseR) + Math.abs(g - baseG) + Math.abs(b - baseB);
      const isNearWhite = r > 238 && g > 238 && b > 238;
      const isNearCorner = distance < 42;

      if (isNearWhite || isNearCorner) {
        frame.data[index + 3] = 0;
      }
    }

    context.putImageData(frame, 0, 0);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function BrandAssetsManager() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [brands, setBrands] = useState<BrandAsset[]>(initialBrands);
  const [activeBrandId, setActiveBrandId] = useState(initialBrands[0].id);
  const [processingLogo, setProcessingLogo] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const activeBrand = brands.find((brand) => brand.id === activeBrandId) ?? brands[0];

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          brands?: BrandAsset[];
          activeBrandId?: string;
        };

        if (parsed.brands?.length) {
          setBrands(parsed.brands);
          setActiveBrandId(parsed.activeBrandId ?? parsed.brands[0].id);
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify({ brands, activeBrandId }));
  }, [activeBrandId, brands, hydrated]);

  function updateActiveBrand(updater: (brand: BrandAsset) => BrandAsset) {
    setBrands((current) =>
      current.map((brand) => (brand.id === activeBrand.id ? updater(brand) : brand)),
    );
  }

  async function handleLogoUpload(file: File) {
    setProcessingLogo(true);

    try {
      const logoUrl = await removeLogoBackground(file);
      updateActiveBrand((brand) => ({ ...brand, logoUrl }));
      toast.success("Logo 已抠图并应用到品牌资产");
    } catch {
      toast.error("Logo 处理失败，请换一张图片");
    } finally {
      setProcessingLogo(false);
    }
  }

  function addBrand() {
    const nextBrand: BrandAsset = {
      id: crypto.randomUUID(),
      name: `品牌 ${brands.length + 1}`,
      logoUrl: null,
      colors: ["#111827", "#22c55e", "#ffffff"],
      font: "Noto Sans SC",
    };

    setBrands((current) => [...current, nextBrand]);
    setActiveBrandId(nextBrand.id);
  }

  function updateColor(index: number, color: string) {
    updateActiveBrand((brand) => ({
      ...brand,
      colors: brand.colors.map((item, itemIndex) => (itemIndex === index ? color : item)),
    }));
  }

  function addColor() {
    if (activeBrand.colors.length >= 6) {
      return;
    }

    updateActiveBrand((brand) => ({ ...brand, colors: [...brand.colors, "#0ea5e9"] }));
  }

  function removeColor(index: number) {
    if (activeBrand.colors.length <= 3) {
      return;
    }

    updateActiveBrand((brand) => ({
      ...brand,
      colors: brand.colors.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  return (
    <section className="grid min-w-0 gap-4 rounded-md border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">品牌资产管理</h2>
            <Badge className="gap-1" variant="secondary">
              <LockKeyhole className="size-3" />
              Pro 专属
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Logo、品牌色和字体会自动叠加到生成图与导出素材。
          </p>
        </div>
        <Button className="min-h-10" onClick={addBrand} type="button" variant="outline">
          <Plus className="size-4" />
          新增品牌
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
        <div className="grid content-start gap-2 rounded-md border bg-background p-2">
          {brands.map((brand) => (
            <button
              className={cn(
                "flex min-h-12 items-center justify-between rounded-md border px-3 text-left text-sm transition",
                brand.id === activeBrand.id
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
              key={brand.id}
              onClick={() => setActiveBrandId(brand.id)}
              type="button"
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <Building2 className="size-4 shrink-0" />
                <span className="truncate">{brand.name}</span>
              </span>
              {brand.id === activeBrand.id ? <Check className="size-4 shrink-0" /> : null}
            </button>
          ))}
        </div>

        <div className="grid min-w-0 gap-4 rounded-md border bg-background p-4">
          <div className="grid gap-2">
            <Label htmlFor="brand-name">品牌名称</Label>
            <Input
              id="brand-name"
              onChange={(event) =>
                updateActiveBrand((brand) => ({ ...brand, name: event.target.value }))
              }
              value={activeBrand.name}
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Logo</Label>
              <Badge variant="outline">
                <Sparkles className="size-3" />
                自动抠图
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-[144px_minmax(0,1fr)]">
              <div className="grid aspect-square place-items-center rounded-md border bg-muted/60 p-4">
                {activeBrand.logoUrl ? (
                  <Image
                    alt={`${activeBrand.name} Logo`}
                    className="max-h-full max-w-full object-contain"
                    height={112}
                    src={activeBrand.logoUrl}
                    width={112}
                    unoptimized
                  />
                ) : (
                  <ImagePlus className="size-10 text-muted-foreground" />
                )}
              </div>
              <div className="grid content-center gap-3">
                <Button
                  className="min-h-10 w-full sm:w-fit"
                  disabled={processingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <ImagePlus className="size-4" />
                  {processingLogo ? "抠图中..." : "上传 Logo"}
                </Button>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleLogoUpload(file);
                    event.target.value = "";
                  }}
                  ref={fileInputRef}
                  type="file"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  会自动识别纯白或接近背景色的区域，并导出透明 PNG 预览。
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <Label>品牌色</Label>
              <span className="text-xs text-muted-foreground">{activeBrand.colors.length}/6</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {activeBrand.colors.map((color, index) => (
                <div className="flex items-center gap-2" key={`${color}-${index}`}>
                  <Input
                    aria-label={`品牌色 ${index + 1}`}
                    className="h-10 w-14 shrink-0 p-1"
                    onChange={(event) => updateColor(index, event.target.value)}
                    type="color"
                    value={color}
                  />
                  <Input
                    className="font-mono"
                    onChange={(event) => updateColor(index, event.target.value)}
                    value={color}
                  />
                  <Button
                    className="min-h-10"
                    disabled={activeBrand.colors.length <= 3}
                    onClick={() => removeColor(index)}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="min-h-10 w-full sm:w-fit"
              disabled={activeBrand.colors.length >= 6}
              onClick={addColor}
              type="button"
              variant="outline"
            >
              <Palette className="size-4" />
              添加品牌色
            </Button>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brand-font">品牌字体</Label>
            <select
              className="min-h-10 rounded-md border border-input bg-background px-3 text-sm"
              id="brand-font"
              onChange={(event) =>
                updateActiveBrand((brand) => ({ ...brand, font: event.target.value }))
              }
              value={activeBrand.font}
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-3 rounded-md border bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Type className="size-4 text-primary" />
            自动叠加预览
          </div>
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-md border p-4"
            style={{
              background: `linear-gradient(135deg, ${activeBrand.colors[0]}, ${activeBrand.colors[1]})`,
              fontFamily: activeBrand.font,
            }}
          >
            <div className="absolute inset-4 rounded-md bg-background/90 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">AI Effects Studio</p>
                  <p className="mt-1 text-lg font-semibold">{activeBrand.name}</p>
                </div>
                <div className="grid size-14 place-items-center rounded-md border bg-white/90 p-2">
                  {activeBrand.logoUrl ? (
                    <Image
                      alt={`${activeBrand.name} Logo 预览`}
                      className="max-h-full max-w-full object-contain"
                      height={48}
                      src={activeBrand.logoUrl}
                      width={48}
                      unoptimized
                    />
                  ) : (
                    <Building2 className="size-6 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="mt-8 aspect-square rounded-md bg-muted" />
              <div className="mt-4 h-3 w-4/5 rounded-full bg-muted" />
              <div className="mt-2 h-3 w-2/3 rounded-full bg-muted" />
              <div className="absolute inset-x-4 bottom-4 flex gap-2">
                {activeBrand.colors.map((color) => (
                  <span
                    className="h-2 flex-1 rounded-full"
                    key={color}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
