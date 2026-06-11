"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Download,
  FileArchive,
  FileDown,
  FileSpreadsheet,
  Images,
  Layers3,
  Play,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { allTemplates } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MAX_BATCH_SIZE = 100;

type BatchStatus = "queued" | "generating" | "completed" | "failed";

type BatchProduct = {
  id: string;
  sku: string;
  productName: string;
  imageUrl: string;
  imageFileName?: string;
  templateId: string;
  tweak: string;
  status: BatchStatus;
  retryCount: number;
  outputUrl: string;
};

const defaultTemplateId =
  allTemplates.find((template) => template.kind === "image")?.id ??
  allTemplates[0]?.id ??
  "";

const demoProducts: BatchProduct[] = [
  {
    id: "demo-sku-001",
    sku: "SKU-001",
    productName: "通勤显瘦衬衫",
    imageUrl: "https://example.com/products/SKU-001.jpg",
    templateId: defaultTemplateId,
    tweak: "突出面料挺括和通勤场景",
    status: "queued",
    retryCount: 0,
    outputUrl: "",
  },
  {
    id: "demo-sku-002",
    sku: "SKU-002",
    productName: "轻奢羊毛大衣",
    imageUrl: "https://example.com/products/SKU-002.jpg",
    templateId: defaultTemplateId,
    tweak: "画面偏高级棚拍，强调质感",
    status: "queued",
    retryCount: 0,
    outputUrl: "",
  },
  {
    id: "demo-sku-003",
    sku: "SKU-003",
    productName: "小个子直筒裤",
    imageUrl: "https://example.com/products/SKU-003.jpg",
    templateId: defaultTemplateId,
    tweak: "突出显高显瘦，对比日常穿搭",
    status: "queued",
    retryCount: 0,
    outputUrl: "",
  },
];

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((item) => item.trim())) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((item) => item.trim())) {
    rows.push(row);
  }

  const [headers = [], ...dataRows] = rows;
  const normalizedHeaders = headers.map(normalizeHeader);

  return dataRows.map((items) => {
    const record: Record<string, string> = {};
    items.forEach((item, index) => {
      record[normalizedHeaders[index] ?? `column${index}`] = item.trim();
    });
    return record;
  });
}

function tableRowsToRecords(rows: unknown[][]) {
  const [headers = [], ...dataRows] = rows;
  const normalizedHeaders = headers.map((header) =>
    normalizeHeader(String(header ?? "")),
  );

  return dataRows
    .filter((items) => items.some((item) => String(item ?? "").trim()))
    .map((items) => {
      const record: Record<string, string> = {};

      items.forEach((item, index) => {
        record[normalizedHeaders[index] ?? `column${index}`] = String(
          item ?? "",
        ).trim();
      });

      return record;
    });
}

function pickRecordValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key] ?? record[normalizeHeader(key)];

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
}

function recordsToProducts(records: Record<string, unknown>[]) {
  return records.slice(0, MAX_BATCH_SIZE).map((record, index) => {
    const sku =
      pickRecordValue(record, ["sku", "SKU", "货号", "商品编码"]) ||
      `SKU-${String(index + 1).padStart(3, "0")}`;
    const productName =
      pickRecordValue(record, ["产品名", "商品名", "productname", "name"]) ||
      `产品 ${index + 1}`;
    const imageUrl = pickRecordValue(record, [
      "图片URL",
      "图片url",
      "imageurl",
      "image",
      "url",
    ]);

    return {
      id: `${sku}-${index}`,
      sku,
      productName,
      imageUrl,
      templateId: defaultTemplateId,
      tweak: "",
      status: "queued" as const,
      retryCount: 0,
      outputUrl: "",
    };
  });
}

function getFileSku(file: File) {
  return file.name.replace(/\.[^.]+$/, "");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string | number) {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function BatchPanel({ compact = false }: { compact?: boolean }) {
  const [products, setProducts] = useState<BatchProduct[]>(demoProducts);
  const [templateId, setTemplateId] = useState(defaultTemplateId);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const completedCount = products.filter(
    (product) => product.status === "completed",
  ).length;
  const failedCount = products.filter((product) => product.status === "failed").length;
  const progressValue = products.length
    ? Math.round((completedCount / products.length) * 100)
    : 0;
  const remainingMinutes = products.length
    ? Math.max(1, Math.ceil((products.length - completedCount) / 7))
    : 0;

  const selectedTemplate = useMemo(
    () => allTemplates.find((template) => template.id === templateId),
    [templateId],
  );

  const applyTemplateToAll = useCallback((nextTemplateId: string) => {
    setTemplateId(nextTemplateId);
    setProducts((items) =>
      items.map((item) => ({ ...item, templateId: nextTemplateId })),
    );
  }, []);

  const onImageDrop = useCallback((files: File[]) => {
    const accepted = files.slice(0, MAX_BATCH_SIZE);

    setProducts((current) => {
      const bySku = new Map(current.map((item) => [item.sku, item]));

      accepted.forEach((file, index) => {
        const sku = getFileSku(file);
        const existing = bySku.get(sku);
        const imageUrl = URL.createObjectURL(file);

        bySku.set(sku, {
          id: existing?.id ?? `${sku}-${index}-${Date.now()}`,
          sku,
          productName: existing?.productName ?? sku,
          imageUrl,
          imageFileName: file.name,
          templateId: existing?.templateId ?? templateId,
          tweak: existing?.tweak ?? "",
          status: existing?.status ?? "queued",
          retryCount: existing?.retryCount ?? 0,
          outputUrl: existing?.outputUrl ?? "",
        });
      });

      return Array.from(bySku.values()).slice(0, MAX_BATCH_SIZE);
    });

    toast.success(`已导入 ${accepted.length} 张产品图`);
  }, [templateId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: MAX_BATCH_SIZE,
    multiple: true,
    onDrop: onImageDrop,
  });

  async function importTable(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    let records: Record<string, unknown>[] = [];

    if (ext === "csv") {
      records = parseCsv(await file.text());
    } else if (ext === "xlsx") {
      const { readSheet } = await import("read-excel-file/browser");
      records = tableRowsToRecords(await readSheet(file));
    } else {
      toast.error("请上传 CSV 或 XLSX 表格");
      return;
    }

    const nextProducts = recordsToProducts(records);
    setProducts(nextProducts);
    toast.success(`已导入 ${nextProducts.length} 个 SKU`);
  }

  function updateProduct(
    id: string,
    patch: Partial<Pick<BatchProduct, "productName" | "templateId" | "tweak">>,
  ) {
    setProducts((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function startBatchGenerate() {
    if (!products.length || running) {
      return;
    }

    setRunning(true);
    setProducts((items) =>
      items.map((item) => ({
        ...item,
        status: "queued",
        retryCount: 0,
        outputUrl: "",
      })),
    );

    timerRef.current = window.setInterval(() => {
      setProducts((items) => {
        const next = [...items];
        const targetIndex = next.findIndex((item) => item.status !== "completed");

        if (targetIndex === -1) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setRunning(false);
          toast.success("批量生成完成");
          return next;
        }

        const target = next[targetIndex];

        if ((targetIndex + 1) % 11 === 0 && target.retryCount === 0) {
          next[targetIndex] = {
            ...target,
            status: "failed",
            retryCount: 1,
          };
          toast.error(`${target.sku} 生成失败，已自动重试`);
          return next;
        }

        next[targetIndex] = {
          ...target,
          status: "completed",
          outputUrl: `https://cdn.ai-effects-studio.local/generated/${target.sku}.png`,
        };
        return next;
      });
    }, 450);
  }

  function resetBatch() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
    setProducts((items) =>
      items.map((item) => ({
        ...item,
        status: "queued",
        retryCount: 0,
        outputUrl: "",
      })),
    );
  }

  function exportCsv() {
    const header = ["SKU", "产品名", "图片URL", "生成图URL", "状态", "重试次数"];
    const body = products.map((product) => [
      product.sku,
      product.productName,
      product.imageUrl,
      product.outputUrl,
      product.status,
      product.retryCount,
    ]);
    const csv = [header, ...body]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    downloadBlob(
      new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }),
      "sku-generated-url-map.csv",
    );
  }

  async function downloadZip() {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const csvRows = [
      ["SKU", "产品名", "生成图URL"],
      ...products.map((product) => [
        product.sku,
        product.productName,
        product.outputUrl,
      ]),
    ];

    products.forEach((product) => {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#f7f4ea"/><text x="48" y="120" font-size="44" font-family="Arial" fill="#1f3f3a">${product.sku}</text><text x="48" y="190" font-size="34" font-family="Arial" fill="#1f3f3a">${product.productName}</text><text x="48" y="260" font-size="24" font-family="Arial" fill="#2f8f7b">${product.outputUrl || "pending"}</text></svg>`;
      zip.file(`${product.sku}.svg`, svg);
    });
    zip.file(
      "sku-generated-url-map.csv",
      `\ufeff${csvRows
        .map((row) => row.map((value) => csvEscape(value)).join(","))
        .join("\n")}`,
    );

    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, "batch-generated-by-sku.zip");
  }

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>批量生成</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <p>导入 SKU 表格或最多 100 张产品图，统一套用模板批量生成。</p>
          <Button variant="outline">
            <Layers3 className="size-4" />
            打开批量工作台
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Layers3 className="size-5 text-primary" />
            批量生成工作台
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="flex min-h-32 flex-col justify-center rounded-md border border-dashed bg-card p-4 text-left transition hover:border-primary hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <FileSpreadsheet className="mb-3 size-7 text-primary" />
                <span className="font-medium">CSV/Excel 表格导入</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  字段：SKU、产品名、图片URL。
                </span>
              </button>
              <input
                accept=".csv,.xlsx"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importTable(file);
                  event.target.value = "";
                }}
                ref={fileInputRef}
                type="file"
              />
              <div
                {...getRootProps()}
                className={cn(
                  "flex min-h-32 cursor-pointer flex-col justify-center rounded-md border border-dashed bg-card p-4 transition hover:border-primary hover:bg-primary/5",
                  isDragActive ? "border-primary bg-primary/5" : "",
                )}
              >
                <input {...getInputProps()} />
                <UploadCloud className="mb-3 size-7 text-primary" />
                <span className="font-medium">拖拽上传产品图</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  最多 100 张，默认用文件名匹配 SKU。
                </span>
              </div>
            </div>

            <div className="grid gap-3 rounded-md border bg-muted/35 p-3">
              <div className="grid gap-2">
                <Label htmlFor="batch-template">统一模板</Label>
                <select
                  className="min-h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  id="batch-template"
                  onChange={(event) => applyTemplateToAll(event.target.value)}
                  value={templateId}
                >
                  {allTemplates.slice(0, 40).map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title} · {template.creditCost} credits
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                当前模板：{selectedTemplate?.title ?? "未选择"}，会应用到所有产品。
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-md bg-background p-2">
                  <p className="text-lg font-semibold">{products.length}</p>
                  <p className="text-xs text-muted-foreground">SKU</p>
                </div>
                <div className="rounded-md bg-background p-2">
                  <p className="text-lg font-semibold">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">完成</p>
                </div>
                <div className="rounded-md bg-background p-2">
                  <p className="text-lg font-semibold">{failedCount}</p>
                  <p className="text-xs text-muted-foreground">重试中</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-md border bg-card p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  已完成 {completedCount}/{products.length}，预计剩余{" "}
                  {remainingMinutes} 分钟
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  失败任务会自动重试 2 次，导出文件按 SKU 命名。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={running || !products.length} onClick={startBatchGenerate}>
                  <Play className="size-4" />
                  一键批量生成
                </Button>
                <Button onClick={resetBatch} type="button" variant="outline">
                  <RefreshCcw className="size-4" />
                  重置
                </Button>
              </div>
            </div>
            <Progress value={progressValue} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="inline-flex items-center gap-2">
            <Images className="size-5 text-primary" />
            产品队列
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={downloadZip} type="button" variant="outline">
              <FileArchive className="size-4" />
              下载全部尺寸 ZIP
            </Button>
            <Button onClick={exportCsv} type="button" variant="outline">
              <FileDown className="size-4" />
              导出 CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {products.map((product) => (
              <article
                className="grid gap-3 rounded-md border bg-background p-3 lg:grid-cols-[120px_minmax(0,1fr)_minmax(220px,320px)_120px]"
                key={product.id}
              >
                <div>
                  <p className="text-xs text-muted-foreground">SKU</p>
                  <p className="break-all font-mono text-sm font-medium">
                    {product.sku}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-flex rounded-md px-2 py-1 text-xs",
                      product.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : product.status === "failed"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {product.status === "completed"
                      ? "已完成"
                      : product.status === "failed"
                        ? `重试 ${product.retryCount}/2`
                        : product.status === "generating"
                          ? "生成中"
                          : "排队中"}
                  </span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`name-${product.id}`}>产品名</Label>
                  <Input
                    id={`name-${product.id}`}
                    onChange={(event) =>
                      updateProduct(product.id, {
                        productName: event.target.value,
                      })
                    }
                    value={product.productName}
                  />
                  <p className="break-all text-xs text-muted-foreground">
                    {product.imageFileName || product.imageUrl || "未绑定图片"}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`template-${product.id}`}>模板微调</Label>
                  <select
                    className="min-h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    id={`template-${product.id}`}
                    onChange={(event) =>
                      updateProduct(product.id, {
                        templateId: event.target.value,
                      })
                    }
                    value={product.templateId}
                  >
                    {allTemplates.slice(0, 40).map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    className="min-h-20"
                    onChange={(event) =>
                      updateProduct(product.id, { tweak: event.target.value })
                    }
                    placeholder="每个产品可单独补充卖点、场景或风格"
                    value={product.tweak}
                  />
                </div>
                <div className="grid content-start gap-2 text-sm">
                  <p className="text-xs text-muted-foreground">生成图 URL</p>
                  <p className="break-all text-muted-foreground">
                    {product.outputUrl || "等待生成"}
                  </p>
                  <Button size="sm" type="button" variant="outline">
                    <Download className="size-4" />
                    单独下载
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
