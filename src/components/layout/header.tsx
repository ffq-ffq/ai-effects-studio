import Link from "next/link";
import { Aperture, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";

const navItems = [
  { href: "", label: "首页" },
  { href: "templates", label: "模板市场" },
  { href: "studio", label: "创作台" },
  { href: "pricing", label: "定价" },
  { href: "gallery", label: "画廊" },
] as const;

export function Header({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#171510]/10 bg-[#f8f4ea]/88 shadow-[0_18px_50px_rgba(23,21,16,0.08)] backdrop-blur-md dark:border-[#171510]/10 dark:bg-[#f8f4ea]/88">
      <div className="mx-auto flex h-16 w-full max-w-[1720px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
        <Link
          className="flex items-center gap-2 font-semibold"
          href={`/${locale}`}
        >
          <span className="flex size-9 items-center justify-center rounded-md border border-[#d7bd7a]/30 bg-[#d7bd7a] text-[#171510] shadow-[0_10px_28px_rgba(215,189,122,0.18)]">
            <Aperture className="size-4" />
          </span>
          <span className="text-[#171510]">AI 效果工坊</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-[#171510]/58 transition hover:bg-[#171510]/6 hover:text-[#171510]"
              href={`/${locale}/${item.href}`}
              key={item.href || "home"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            className={cn(
              buttonVariants(),
              "hidden rounded-md bg-[#171510] text-white shadow-[0_12px_30px_rgba(23,21,16,0.16)] hover:bg-[#2a251b] sm:inline-flex",
            )}
            href={`/${locale}/studio`}
          >
            开始创作
            <ArrowRight className="size-4" />
          </Link>
          <MobileNav locale={locale} />
        </div>
      </div>
    </header>
  );
}
