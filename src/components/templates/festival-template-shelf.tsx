import { CalendarDays, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getActiveFestivalCampaigns, formatFestivalDate } from "@/lib/constants";

export function FestivalTemplateShelf() {
  const campaigns = getActiveFestivalCampaigns();

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-3 rounded-md border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">节日营销模板</h2>
            <Badge variant="secondary">
              <Sparkles className="size-3" />
              自动上架
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            节日前 14 天自动推送对应海报、短视频和营销文案模板。
          </p>
        </div>
        <Badge className="w-fit" variant="outline">
          <CalendarDays className="size-3" />
          已上架 {campaigns.length} 个节日
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {campaigns.map((campaign) => (
          <article className="rounded-md border bg-background p-4" key={campaign.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{campaign.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{campaign.theme}</p>
              </div>
              <Badge variant="secondary">{campaign.daysUntil} 天</Badge>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              节日日期：{formatFestivalDate(campaign.date)}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {campaign.copyHint}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {campaign.industries.slice(0, 3).map((industry) => (
                <Badge key={industry} variant="outline">
                  {industry}
                </Badge>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
