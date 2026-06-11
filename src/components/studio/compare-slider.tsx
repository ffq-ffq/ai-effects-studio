"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CompareSliderProps = {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  description?: string;
  className?: string;
};

export function CompareSlider({
  beforeImage = "/templates/local-store-promo.png",
  afterImage = "/templates/fashion-outfit-model.png",
  beforeLabel = "原图",
  afterLabel = "生成图",
  title = "A/B 对比",
  description = "左侧原图，右侧生成图",
  className,
}: CompareSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const nextPosition = ((clientX - rect.left) / rect.width) * 100;

    setPosition(Math.min(100, Math.max(0, Math.round(nextPosition))));
  }, []);

  return (
    <section
      className={cn(
        "min-w-0 w-full max-w-full overflow-hidden rounded-md border bg-card p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-full border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
          {position}%
        </div>
      </div>

      <div
        className="relative isolate aspect-[4/3] min-h-[240px] w-full max-w-full touch-none overflow-hidden rounded-md border bg-muted select-none"
        onPointerCancel={() => setIsDragging(false)}
        onPointerDown={(event) => {
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
          updatePosition(event.clientX);
        }}
        onPointerMove={(event) => {
          if (isDragging) {
            updatePosition(event.clientX);
          }
        }}
        onPointerUp={(event) => {
          setIsDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        ref={trackRef}
      >
        <Image
          alt={afterLabel}
          className="absolute inset-0 size-full object-cover"
          draggable={false}
          fill
          sizes="(min-width: 1280px) 520px, (min-width: 768px) 50vw, 100vw"
          src={afterImage}
        />
        <Image
          alt={beforeLabel}
          className="absolute inset-0 size-full object-cover"
          draggable={false}
          fill
          sizes="(min-width: 1280px) 520px, (min-width: 768px) 50vw, 100vw"
          src={beforeImage}
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-between px-3 text-xs font-medium">
          <span className="rounded-full bg-background/90 px-3 py-1 text-foreground shadow-sm">
            {beforeLabel}
          </span>
          <span className="rounded-full bg-background/90 px-3 py-1 text-foreground shadow-sm">
            {afterLabel}
          </span>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.18)]"
          style={{ left: `${position}%` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 z-10 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background text-foreground shadow-lg"
          style={{ left: `${position}%` }}
        >
          <ChevronsLeftRight className="size-5" />
        </div>

        <input
          aria-label="A/B 对比滑块"
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
          max={100}
          min={0}
          onChange={(event) => setPosition(Number(event.target.value))}
          step={1}
          type="range"
          value={position}
        />
      </div>
    </section>
  );
}
