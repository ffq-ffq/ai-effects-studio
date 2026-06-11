import { Coins } from "lucide-react";
import { formatCredits } from "@/lib/utils";

export function CreditsDisplay({ credits = 600 }: { credits?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-card p-4">
      <Coins className="size-5 text-primary" />
      <div>
        <p className="text-sm text-muted-foreground">可用额度</p>
        <p className="text-xl font-semibold">{formatCredits(credits)}</p>
      </div>
    </div>
  );
}
