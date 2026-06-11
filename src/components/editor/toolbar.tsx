import { Crop, RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Toolbar() {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border bg-card p-2">
      <Button aria-label="裁剪" size="icon" variant="outline">
        <Crop className="size-4" />
      </Button>
      <Button aria-label="撤销" size="icon" variant="outline">
        <RotateCcw className="size-4" />
      </Button>
      <Button aria-label="文字" size="icon" variant="outline">
        <Type className="size-4" />
      </Button>
    </div>
  );
}
