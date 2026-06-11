"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, UserRound, WandSparkles } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "", label: "首页", icon: Home },
  { href: "studio", label: "创作", icon: WandSparkles },
  { href: "gallery", label: "画廊", icon: Images },
  { href: "dashboard", label: "我的", icon: UserRound },
] as const;

export function BottomTabs({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl border border-[#171510]/10 bg-[#f8f4ea]/92 p-1.5 shadow-[0_18px_60px_rgba(23,21,16,0.18)] backdrop-blur-xl lg:hidden">
      {tabs.map((tab) => {
        const href = `/${locale}${tab.href ? `/${tab.href}` : ""}`;
        const isActive =
          tab.href === ""
            ? pathname === `/${locale}`
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition",
              isActive
                ? "bg-[#171510] text-[#f8f4ea] shadow-[0_10px_28px_rgba(23,21,16,0.16)]"
                : "text-[#171510]/58 hover:bg-white/70 hover:text-[#171510]",
            )}
            href={href}
            key={tab.href || "home"}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
