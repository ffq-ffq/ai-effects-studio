"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoUploadZoneProps = {
  onVideoSelected?: (file: File | null) => void;
};

export function VideoUploadZone({ onVideoSelected }: VideoUploadZoneProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0];

      if (!file) {
        return;
      }

      const nextUrl = URL.createObjectURL(file);
      setPreviewUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        return nextUrl;
      });
      setFileName(file.name);
      onVideoSelected?.(file);
    },
    [onVideoSelected],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      accept: { "video/*": [".mp4", ".webm", ".mov"] },
      maxFiles: 1,
      maxSize: 50 * 1024 * 1024,
      multiple: false,
      onDrop,
    });

  return (
    <div className="grid gap-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition",
          isDragActive ? "border-primary bg-primary/5" : "border-border bg-card",
        )}
      >
        <input {...getInputProps()} />
        <Camera className="mb-3 size-8 text-primary" />
        <p className="font-medium">上传真人口播视频</p>
        <p className="mt-1 text-sm text-muted-foreground">
          MP4/MOV/WebM，最长 30 秒，最大 50MB。
        </p>
      </div>

      {fileRejections.length ? (
        <p className="text-sm text-destructive">
          视频格式或大小不符合要求，请上传 50MB 以内的视频文件。
        </p>
      ) : null}

      {previewUrl ? (
        <div className="overflow-hidden rounded-md border bg-card">
          <video className="aspect-video w-full bg-black" controls src={previewUrl}>
            <track kind="captions" />
          </video>
          <p className="px-3 py-2 text-sm text-muted-foreground">{fileName}</p>
        </div>
      ) : null}
    </div>
  );
}
