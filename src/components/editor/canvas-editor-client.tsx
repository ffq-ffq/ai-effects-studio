"use client";

import dynamic from "next/dynamic";

export const CanvasEditorClient = dynamic(
  () => import("@/components/editor/canvas-editor").then((mod) => mod.CanvasEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[420px] rounded-md border bg-card p-4 text-sm text-muted-foreground">
        编辑器加载中...
      </div>
    ),
  },
);
