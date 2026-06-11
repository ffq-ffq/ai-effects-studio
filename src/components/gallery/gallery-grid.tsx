import { Card, CardContent } from "@/components/ui/card";

const galleryItems = ["服装模特图", "餐品海报", "房产短视频", "口播改词"] as const;

export function GalleryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {galleryItems.map((item) => (
        <Card key={item}>
          <CardContent className="aspect-[4/5] rounded-md bg-muted p-4">
            <div className="flex h-full items-end rounded-md bg-background/70 p-3 text-sm font-medium">
              {item}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
