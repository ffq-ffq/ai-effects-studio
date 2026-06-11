"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  title?: string;
  description?: string;
  onFilesSelected?: (files: File[]) => void;
};

export function UploadZone({
  title = "拖拽或点击上传图片素材",
  description = "支持 JPG、PNG、WebP，可上传商品图、平铺图或门店图。",
  onFilesSelected,
}: UploadZoneProps) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const onDrop = useCallback(
    (files: File[]) => {
      setFileNames(files.map((file) => file.name));
      onFilesSelected?.(files);
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: true,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition",
        isDragActive ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mb-3 size-8 text-primary" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {fileNames.length ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {fileNames.map((name) => (
            <span className="rounded-md bg-secondary px-2 py-1 text-xs" key={name}>
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
