import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-input bg-white/62 px-3 py-2.5 text-base shadow-inner shadow-amber-950/5 transition-all outline-none placeholder:text-muted-foreground focus-visible:border-[#f59e0b]/80 focus-visible:ring-2 focus-visible:ring-[#f59e0b]/35 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-sm dark:bg-[#24170f]/55 dark:focus-visible:shadow-[0_0_28px_rgba(245,158,11,0.18)] dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 light:bg-white/70 light:shadow-amber-900/10",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
