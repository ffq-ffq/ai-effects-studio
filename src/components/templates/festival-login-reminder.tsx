"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { CalendarDays, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  formatFestivalDate,
  getActiveFestivalCampaigns,
  getActiveFestivalTemplates,
} from "@/lib/constants";

const dismissedKey = "ai-effects-studio-festival-reminder";

export function FestivalLoginReminder() {
  const router = useRouter();
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const campaigns = useMemo(() => getActiveFestivalCampaigns(), []);
  const templates = useMemo(() => getActiveFestivalTemplates(), []);
  const [open, setOpen] = useState(false);

  const reminderId = campaigns.map((campaign) => campaign.id).join("|");
  const canShowInCurrentSession = isAuthenticated || process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!campaigns.length || !canShowInCurrentSession || !reminderId) {
      return;
    }

    const dismissed = window.localStorage.getItem(dismissedKey);

    if (dismissed !== reminderId) {
      const timer = window.setTimeout(() => setOpen(true), 700);
      return () => window.clearTimeout(timer);
    }
  }, [campaigns.length, canShowInCurrentSession, reminderId]);

  if (!campaigns.length || !canShowInCurrentSession) {
    return null;
  }

  function dismiss(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      window.localStorage.setItem(dismissedKey, reminderId);
    }
  }

  return (
    <Dialog onOpenChange={dismiss} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            节日营销模板已上架
          </DialogTitle>
          <DialogDescription>
            系统检测到未来 14 天内有节日节点，已自动推送海报、短视频和营销文案模板。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {campaigns.map((campaign) => (
            <div className="rounded-md border bg-muted/40 p-3" key={campaign.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{campaign.name}</div>
                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3" />
                  {formatFestivalDate(campaign.date)}
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {campaign.theme} · 距离节日 {campaign.daysUntil} 天
              </p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            className="min-h-10"
            onClick={() => {
              dismiss(false);
              router.push(`/${locale}/templates`);
            }}
            type="button"
          >
            查看 {templates.length} 个节日模板
          </Button>
          <Button className="min-h-10" onClick={() => dismiss(false)} type="button" variant="outline">
            稍后再看
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
